import { onRequest, onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";
import config from "../config.json";
import {
  addUserToSubscription,
  getAdminPermission,
  getDefaultPermission,
  getDoc,
  getPermissions,
  getStripeCustomerId,
  getUserByEmail,
  updateInvoice,
  updateSubscription
} from "./utils";

admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((req, res) => {
  logger.info("Hello logs!", { structuredData: true });
  res.send("Hello from Call!");
});

/**
 * create a subscription
 */
export const createSubscription = onCall((request) => {
  const data = request?.data;
  const context = request?.auth;
  logger.info(request.data);
  logger.info(request.auth);
  const stripe = require('stripe')(config.stripe.secret_api_key);
  const paymentMethodId = data?.paymentMethodId || null;
  const billingDetails = data?.billingDetails || null;
  let selectedPlan: any = (config.plans.find(obj => obj.id === data.planId) || {});
  if (selectedPlan.legacy) {
    throw new HttpsError('internal', "The plan is not available.");
  }
  return getStripeCustomerId(
    context?.uid || '',
    context?.token.name,
    context?.token.email || '',
    paymentMethodId,
    billingDetails
  ).then(stripeCustomerId => {
    // create subscription
    const items: any[] = [];
    for (const index in selectedPlan.priceIds) {
      items.push({
        price: selectedPlan.priceIds[index]
      });
    }
    const udata: any = {
      customer: stripeCustomerId,
      items: items
    }
    if (selectedPlan.free === false) {
      udata.default_payment_method = paymentMethodId;
    }
    return stripe.subscriptions.create(udata);
  }).then(subscription => {
    // init permissions
    const permissions = {}
    for (let p in config.permissions) {
      // grant all permissions to the current user
      // @ts-ignore
      permissions[p] = [];
      // @ts-ignore
      permissions[p].push(context.uid);
    }
    // get items from the subscription and their price IDs
    let items: any = {};
    for (const index in subscription.items.data) {
      const item = subscription.items.data[index];
      if (item.price && item.price.id) {
        if (selectedPlan.priceIds.indexOf(item.price.id) === -1) {
          throw new Error("Invalid price ID in a subscription item.");
        } else {
          items[item.price.id] = item.id;
        }
      } else {
        throw new Error("Missing price ID in a subscription item.");
      }
    }
    const sub = {
      plan: selectedPlan.title, // title of the plan
      stripeItems: items, // price ID in stripe
      paymentCycle: selectedPlan.frequency,
      planId: selectedPlan.id, // plan ID
      currency: selectedPlan.currency,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionCreated: subscription.created,
      subscriptionCurrentPeriodStart: subscription.current_period_start,
      subscriptionCurrentPeriodEnd: subscription.current_period_end,
      subscriptionEnded: subscription.ended || 0,
      ownerId: context?.uid,
      permissions: permissions,
      paymentMethod: subscription.default_payment_method,
      creationTime: (new Date())
      //billingCountry: data.billing.country,
      //billingState: data.billing.state                    
    }
    return admin.firestore().collection('subscriptions').add(sub);
  }).then(sub => {
    return {
      subscriptionId: sub.id
    }
  }).catch(error => {
    throw new HttpsError('internal', error.message);
  });
});

export const getSubscriptionUsers = onCall(async (request) => {
  const data = request?.data;
  const context = request?.auth;
  const result: any = {
    total: 0,
    users: []
  }
  let permissions: any = [];
  //@ts-ignore
  return getDoc("subscriptions/" + data?.subscriptionId).then((subRef) => {
    // check if the user is an admin level user
    if (subRef.data()?.ownerId === context?.uid || subRef.data()?.permissions[getAdminPermission()].indexOf(context?.uid) !== -1) {
      const userList = subRef.data()?.permissions[getDefaultPermission()];
      permissions = subRef.data()?.permissions;
      // get total
      result.total = userList.length;
      if (result.total === 0) {
        return {
          empty: true
        }
      } else {
        // query user data
        const usersRef = admin.firestore().collection("users");
        const invitesRef = admin.firestore().collection("invites").where("subscriptionId", "==", data?.subscriptionId);
        return Promise.all([usersRef.where(admin.firestore.FieldPath.documentId(), "in", userList).get(), invitesRef.get()]);
      }
    } else {
      throw new Error("Permission denied.");
    }
    //@ts-ignore
  }).then(([usersSnapshot, invitesSnapshot]) => {
    if (!usersSnapshot.empty) {
      // return users
      usersSnapshot.forEach((user: any) => {
        result.users.push({
          id: user.id,
          displayName: user.data()?.displayName,
          photoURL: user.data()?.photoURL,
          email: user.data()?.email,
          permissions: getPermissions(permissions, user.id),
          type: 'user'
        });
      });
    }
    if (!invitesSnapshot.empty) {
      invitesSnapshot.forEach((invite: any) => {
        result.users.push({
          id: invite.id,
          displayName: invite.data()?.displayName,
          photoURL: null,
          email: invite.data()?.email,
          permissions: invite.data()?.permissions,
          type: 'invite'
        })
      })
    }
    return result;
  }).catch(err => {
    throw new HttpsError('internal', err.message);
  });
});

export const inviteUser = onCall((request) => {
  const data = request?.data;
  const context = request?.auth;
  let subDoc: any = null;
  let inviteId: any = null;
  return getDoc("subscriptions/" + data?.subscriptionId).then(subRef => {
    // check if the user is an admin level user
    subDoc = subRef;
    if (subRef.data()?.ownerId === context?.uid || subRef.data()?.permissions[getAdminPermission()].indexOf(context?.uid) !== -1) {
      return getUserByEmail(data?.email);
    } else {
      throw new Error("Permission denied.");
    }
  }).then(user => {
    if (user !== null) {
      if (subDoc.data()?.permissions[getDefaultPermission()].indexOf(user.uid) !== -1) {
        throw new Error("The user already have access.");
      }
    }
    return admin.firestore().collection('invites').where('email', '==', data?.email).where('subscriptionId', '==', data?.subscriptionId).get();
  }).then(subSnapshot => {
    if (subSnapshot.empty) {
      return admin.firestore().collection('invites').add({
        email: data?.email,
        subscriptionId: data?.subscriptionId,
        displayName: data?.displayName,
        permissions: data?.permissions,
        subscriptionName: subDoc.data()?.name || "",
        sender: context?.token.name,
        creationTime: (new Date())
      });
    } else {
      throw new Error("Duplicate invite.");
    }
  }).then((invite) => {
    inviteId = invite.id;
    //@ts-ignore mailgun-error
    if (config.mailgun) {
      const mailgun = require("mailgun-js");
      //@ts-ignore mailgun-error
      const mg = mailgun({ apiKey: config.mailgun.api_key, domain: config.mailgun.domain });
      const mailData = {
        //@ts-ignore mailgun-error
        from: config.mailgun.from,
        to: data?.email,
        subject: data.displayName + ", you are invited to " + config.site_name,
        //@ts-ignore mailgun-error
        template: config.mailgun.templates.invite_email,
        'v:sender': context?.token.name,
        'v:site_name': config.site_name,
        'v:name': data.displayName,
        'v:sign_in_url': config.sign_in_url,
        'v:sign_up_url': config.sign_up_url
      }
      return mg.messages().send(mailData);
    } else {
      // skip invite email
      return {}
    }
  }).then(invite => {
    return {
      inviteId: inviteId
    }
  }).catch(err => {
    throw new HttpsError('internal', err.message);
  });
});

export const revokeInvite = onCall((request) => {
  const data = request?.data;
  const context = request?.auth;
  return Promise.all([getDoc("subscriptions/" + data?.subscriptionId), getDoc("invites/" + data?.inviteId)]).then(([subRef, inviteRef]) => {
    // check if the user is an admin level user
    if ((subRef.data()?.ownerId === context?.uid || subRef.data()?.permissions[getAdminPermission()].indexOf(context?.uid) !== -1) && inviteRef.data()?.subscriptionId === subRef.id) {
      return admin.firestore().doc("invites/" + data?.inviteId).delete();
    } else {
      throw new Error("Permission denied.");
    }
  }).then(res => {
    return {
      result: 'success'
    }
  }).catch(err => {
    throw new HttpsError('internal', err.message);
  });
});

export const acceptInvite = onCall((request) => {
  const data = request?.data;
  const context = request?.auth;
  let subscriptionId: any = null;
  let permissions: any[] = [];
  return getDoc("invites/" + data.inviteId).then(inviteRef => {
    if (inviteRef.data()?.email === context?.token.email) {
      if (context?.token.email_verified) {
        subscriptionId = inviteRef.data()?.subscriptionId;
        permissions = inviteRef.data()?.permissions;
        return admin.firestore().doc("invites/" + data?.inviteId).delete();
      } else {
        throw new Error("Email is not verified.");
      }
    } else {
      throw new Error("Permission denied.");
    }
  }).then(() => {
    return addUserToSubscription(subscriptionId, context?.uid || '', permissions);
  }).then(() => {
    return {
      result: 'success'
    }
  }).catch(err => {
    throw new HttpsError('internal', err.message);
  });
});

export const updateSubscriptionPaymentMethod = onCall((request) => {
  const data = request?.data;
  const context = request?.auth;
  const stripe = require('stripe')(config.stripe.secret_api_key);
  const paymentMethodId = data?.paymentMethodId || null;
  const billingDetails = data?.billingDetails || null;
  let stripeSubscriptionId = "";
  return getDoc("subscriptions/" + data?.subscriptionId).then(subRef => {
    // check if the user is an admin level user
    if (subRef.data()?.ownerId === context?.uid) {
      stripeSubscriptionId = subRef.data()?.stripeSubscriptionId;
      return getStripeCustomerId(
        context?.uid || '',
        context?.token.name,
        context?.token.email || '',
        paymentMethodId,
        billingDetails
      );
    } else {
      throw new Error("Permission denied.");
    }
  }).then(() => {
    return stripe.subscriptions.update(
      stripeSubscriptionId,
      {
        default_payment_method: data?.paymentMethodId
      }
    )
  }).then(() => {
    return {
      result: 'success'
    }
  }).catch(err => {
    throw new HttpsError('internal', err.message);
  });
});

export const removePaymentMethod = onCall((request) => {
  const data = request?.data;
  const context = request?.auth;
  const stripe = require('stripe')(config.stripe.secret_api_key);
  const paymentMethodId = data?.paymentMethodId || null;
  return admin.firestore().collection("subscriptions").where("paymentMethod", "==", paymentMethodId).get().then((snapshot) => {
    if (snapshot.empty) {
      return getDoc("users/" + context?.uid + "/paymentMethods/" + paymentMethodId);
    } else {
      throw new Error("The payment method is active for at least one subscription");
    }
  }).then(() => {
    return stripe.paymentMethods.detach(paymentMethodId);
  }).then(() => {
    return admin.firestore().doc("users/" + context?.uid + "/paymentMethods/" + paymentMethodId).delete();
  }).catch(err => {
    throw new HttpsError('internal', err.message);
  });
});

export const cancelSubscription = onCall((request) => {
  const data = request?.data;
  const context = request?.auth;
  const stripe = require('stripe')(config.stripe.secret_api_key);
  return getDoc("subscriptions/" + data?.subscriptionId).then(subRef => {
    // check if the user is an admin level user
    if (subRef.data()?.ownerId === context?.uid) {
      return stripe.subscriptions.del(subRef.data()?.stripeSubscriptionId);
    } else {
      throw new Error("Permission denied.");
    }
  }).then(() => {
    return admin.firestore().doc("subscriptions/" + data?.subscriptionId).set({
      permissions: {}
    }, { merge: true });
  }).then(() => {
    return {
      result: 'success'
    }
  }).catch(err => {
    throw new HttpsError('internal', err.message);
  });
});

export const changeSubscriptionPlan = onCall((request) => {
  const data = request?.data;
  const context = request?.auth;
  const stripe = require('stripe')(config.stripe.secret_api_key);
  const paymentMethodId = data?.paymentMethodId || null;
  const billingDetails = data?.billingDetails || null;
  let selectedPlan: any = (config.plans.find(obj => obj.id === data.planId) || {});
  if (selectedPlan.legacy) {
    throw new HttpsError('internal', "The plan is not available.");
  }
  let stripeSubscriptionId = '';
  let addedItems = {};
  const deleteItemIds: any = [];
  return getDoc("subscriptions/" + data?.subscriptionId).then(subRef => {
    // check if the user is an admin level user
    if (subRef.data()?.ownerId === context?.uid) {
      stripeSubscriptionId = subRef.data()?.stripeSubscriptionId;
      for (const priceId in subRef.data()?.stripeItems) {
        deleteItemIds.push(subRef.data()?.stripeItems[priceId]);
      }
      return getStripeCustomerId(
        context?.uid || '',
        context?.token.name,
        context?.token.email || '',
        paymentMethodId,
        billingDetails
      );
    } else {
      throw new Error("Permission denied.");
    }
  }).then(() => {
    // add new subscription items
    const items: any[] = [];
    for (const index in selectedPlan.priceIds) {
      items.push({
        price: selectedPlan.priceIds[index]
      });
    }
    const data: any = {
      cancel_at_period_end: false,
      proration_behavior: 'create_prorations',
      items: items
    };
    if (selectedPlan.free === false) {
      data.default_payment_method = paymentMethodId;
    }
    return stripe.subscriptions.update(
      stripeSubscriptionId,
      data
    );
  }).then((subscription) => {
    // cancel all the existing subscription items
    const deleteItems: any[] = [];
    for (const index in subscription.items.data) {
      const item = subscription.items.data[index];
      if (deleteItemIds.indexOf(item.id) === -1) {
        // newly added item
        if (item.price && item.price.id) {
          if (selectedPlan.priceIds.indexOf(item.price.id) === -1) {
            throw new Error("Invalid price ID in a subscription item.");
          } else {
            //@ts-ignore
            addedItems[item.price.id] = item.id;
          }
        } else {
          throw new Error("Missing price ID in a subscription item.");
        }
      } else {
        // existing item to be deleted
        let setting = {
          proration_behavior: "always_invoice"
        };
        if (item.price.recurring && item.price.recurring.usage_type === 'metered') {
          //@ts-ignore
          setting["clear_usage"] = true;
        }
        deleteItems.push(stripe.subscriptionItems.del(item.id, setting));
      }
    }
    if (deleteItems.length > 0) {
      return Promise.all(deleteItems);
    } else {
      return {};
    }
  }).then(() => {
    return admin.firestore().doc("subscriptions/" + data?.subscriptionId).update({
      plan: selectedPlan.title,
      planId: selectedPlan.id,
      stripeItems: addedItems,
      paymentCycle: selectedPlan.frequency,
      price: selectedPlan.price,
      currency: selectedPlan.currency,
    });
  }).then(() => {
    return {
      result: 'success'
    };
  }).catch(err => {
    throw new HttpsError('internal', err.message);
  });
});

export const changeBillingDetails = onCall(async (request) => {
  const data = request?.data;
  const context = request?.auth;
  try {
    await getStripeCustomerId(
      context?.uid || '',
      context?.token.name,
      context?.token.email || '',
      '',
      data.billingDetails
    );
    return {
      result: 'success'
    };
  } catch (err: any) {
    throw new HttpsError('internal', err.message);
  }
});

export const stripeWebHook = onRequest((req, res) => {
  const stripe = require('stripe')(config.stripe.secret_api_key);
  const endpointSecret = config.stripe.end_point_secret;
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    if (event.type.indexOf('invoice.') === 0) {
      updateInvoice(event.data.object).then(() => res.json({ received: true })
      ).catch(err => res.status(400).send(`Webhook Error: ${err.message}`));
    }
    if (event.type.indexOf('customer.subscription.') === 0) {
      updateSubscription(event.data.object).then(() => res.json({ received: true })
      ).catch(err => res.status(400).send(`Webhook Error: ${err.message}`));
    }
    if (event.type.indexOf('invoice.') !== 0 && event.type.indexOf('customer.subscription.') !== 0) {
      res.status(400).send(`Webhook Error: "No handler for the event type: ${event.type}"`);
    }
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
})

