## Setup Stripe Integration

For the cloud functions to receive data from Stripe, you will need to create a webhook endpoint with the cloud function webhook URL `https://firebse-location-project-id.cloudfunctions.net/fireactjsSaas-stripeWebHook`. Please make sure you replace the domain with your actual Firebase project cloud function domain. Once the webhook is created, you will get an endpoint secret which is needed in the configuration file.

The following Stripe events need to be sent to the endpoint:

```
customer.subscription.updated
customer.subscription.trial_will_end
customer.subscription.pending_update_expired
customer.subscription.pending_update_applied
customer.subscription.deleted
customer.subscription.created
invoice.created
invoice.deleted
invoice.finalized
invoice.marked_uncollectible
invoice.paid
invoice.payment_action_required
invoice.payment_failed
invoice.payment_succeeded
invoice.sent
invoice.updated
invoice.voided
```
## Create `/src/firebaseConfig.json` File
```json
{
  "apiKey": "apikey",
  "authDomain": "domain.firebaseapp.com",
  "projectId": "projectid",
  "storageBucket": "projectid.appspot.com",
  "messagingSenderId": "messaginid",
  "appId": "appId"
}
```

## Create `/src/config.json` File

Create a file called `config.json` in the `/src` folder as the example shows below store the configuration settings.

To integrate with Stripe, the Stripe public API key is required for the `stripe.pubblic_api_key` property.

The Reactjs application needs the `price_id` from Stripe to integrate with the Stripe payment plans. The plans will be shown in the pricing table as the property values in the JSON `plans`. It’s important that the `priceId` property value of each plan matches the plan’s `price_id` in Stripe.

```json
{
  "stripe": {
    "public_api_key": "pk_test_xxxxxxxxxxx"
  },
  "plans": [
    {
      "id": "free",
      "title": "Free",
      "popular": false,
      "priceIds": [
        "price_1OAERjBJQvbauoVYoDdnoJyk"
      ],
      "currency": "$",
      "price": 0,
      "frequency": "week",
      "description": [
        "10 users included",
        "2 GB of storage",
        "Help center access",
        "Email support"
      ],
      "free": true,
      "legacy": false
    },
    {
      "id": "pro",
      "title": "Pro",
      "popular": true,
      "priceIds": [
        "price_1OAEUMBJQvbauoVYFnUiapAT"
      ],
      "currency": "$",
      "price": 10,
      "frequency": "week",
      "description": [
        "20 users included",
        "10 GB of storage",
        "Help center access",
        "Priority email support"
      ],
      "free": false,
      "legacy": false
    },
    {
      "id": "enterprise",
      "title": "Enterprise",
      "popular": false,
      "priceIds": [
        "price_1OAEYcBJQvbauoVYZVZl5u9I"
      ],
      "currency": "$",
      "price": 30,
      "frequency": "week",
      "description": [
        "50 users included",
        "30 GB of storage",
        "Help center access",
        "Phone & email support"
      ],
      "free": false,
      "legacy": false
    }
  ],
  "permissions": {
    "access": {
      "default": true,
      "admin": false
    },
    "admin": {
      "default": false,
      "admin": true
    }
  },
  "subscription": {
    "singular": "project",
    "plural": "projects"
  }
}
```

## Create `/functions/config.json` File

In the `/functions` folder, create a `config.json` file as the example shows below.

You will need to put in the stripe secret API key and the endpoint secret in the configuration file to integrate the cloud functions with Stripe.

If you are in dev mode, you can use the Stripe endpoint secret that is logged when you start the proyect

Plans are also needed for the cloud functions similar to the Reactjs application.

For sending new user invites, the `mailgun` JSON is needed. The details are covered in the next section.

```json
{
  "brand": "My Brand",
  "site_name": "My SaaS App",
  "site_url": "https://app.mydomain.com",
  "sign_in_url": "https://app.mydomain.com/sign-in",
  "sign_up_url": "https://app.mydomain.com/sign-up",
  "stripe": {
    "secret_api_key": "sk_test_dxxxxxxxx",
    "end_point_secret": "whsec_xxxxxxxxx"
  },
  "plans": [
    {
      "id": "free",
      "title": "Free",
      "popular": false,
      "priceIds": [
        "price_1OAERjBJQvbauoVYoDdnoJyk"
      ],
      "currency": "$",
      "price": 0,
      "frequency": "week",
      "description": [
        "10 users included",
        "2 GB of storage",
        "Help center access",
        "Email support"
      ],
      "free": true,
      "legacy": false
    },
    {
      "id": "pro",
      "title": "Pro",
      "popular": true,
      "priceIds": [
        "price_1OAEUMBJQvbauoVYFnUiapAT"
      ],
      "currency": "$",
      "price": 10,
      "frequency": "week",
      "description": [
        "20 users included",
        "10 GB of storage",
        "Help center access",
        "Priority email support"
      ],
      "free": false,
      "legacy": false
    },
    {
      "id": "enterprise",
      "title": "Enterprise",
      "popular": false,
      "priceIds": [
        "price_1OAEYcBJQvbauoVYZVZl5u9I"
      ],
      "currency": "$",
      "price": 30,
      "frequency": "week",
      "description": [
        "50 users included",
        "30 GB of storage",
        "Help center access",
        "Phone & email support"
      ],
      "free": false,
      "legacy": false
    }
  ],
  "permissions": {
    "access": {
      "default": true,
      "admin": false
    },
    "admin": {
      "default": false,
      "admin": true
    }
  }
}
```

## Create `/functions/.env` File
create a .env file with you OpenAi key
```env
OPENAI_API_KEY=your_api_key
```

## Update Firestore Rules

The SaaS package uses Firestore database to store and manage the subscription data, you can find it in [firestore.rule](./firestore.rule). To secure the data, the Firestore rules should be updated in Firestore database rules.

## Setup Mailgun Integration (optional)

The framework integrates with Mailgun to send invite emails when users are invited to join subscription accounts. To setup the integration, retrieve the API key from Mailgun and create a file called `mailgun.json` under the `src` folder as the example below shows.

```json
{
    "api_key": "...",
    "domain": "app.mydomain.com",
    "from": "No Reply <no-reply@app.mydomain.com>",
    "templates":{
        "invite_email": "invite"
}
```

In Mailgun, you will need a template for the invite emails. Create a template called `invite` with the subject line below.

```
{{sender}} invited you to {{site_name}}
```

In the template body, use the following copy.

```
Hi {{name}},

You received this invite because {{sender}} invited you to join {{site_name}}. Please sign in ({{sign_in_url}}) to accept the invite.

If you don't have a user account yet, please sign up ({{sign_up_url}}) here.

Best regards,

The {{site_name}} team
```

The invite template supports the following variables:

- {{sender}} - the name of the person who sends the invite
- {{site_name}} - the name of your web application defined in the cloud function configurations
- {{name}} - the name of the new user who is invited by the sender
- {{sign_in_url}} - the URL to the sign-in page which is defined in the cloud function configurations
- {{sign_up_url}} - the URL to the sign-up page which is defined in the cloud function configurations

Note: The invite email is optional for the invite process. You can skip this step but the new users will need to be informed by other methods so that they know where to sign up and sign in to accept the invites.

## Run your app locally

By now, your app is ready for the first run locally. Use the command `npm start` to start the app.

## Deploy to Firebase

After testing locally, your app is ready to be deployed to Firebase hosting.

### Build

Run `npm run build` to build your app

### Deploy

Run `firebase deploy` to deploy your app to Firebase. If you see a blank screen in your production URL, make sure you set the `build` as the folder in your Firebase settings.
