import './App.css';
import firebaseConfig from "./firebaseConfig.json";
import {
  pathnames,
  AppTemplate,
  AuthProvider,
  AuthRoutes,
  PublicTemplate,
  ResetPassword,
  SignIn,
  SignUp,
  UserMenu,
  UserProfile,
  UserUpdateEmail,
  UserUpdateName,
  UserUpdatePassword,
  UserDelete,
  FireactProvider,
  ActionPages
} from '@fireactjs/core';
import { getApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import authMethods from "./authMethods.json";
import {
  CreateSubscription,
  ListSubscriptions,
  pathnames as subPathnames,
  PermissionRouter,
  Settings,
  SubscriptionMenu,
  ListUsers,
  SubscriptionProvider,
  ListInvoices,
  ManagePaymentMethods,
  ChangePlan,
  CancelSubscription,
  UpdateBillingDetails,
  CreateExam,
  Loader,
  Logo,
  Metrics,
  Dashboard,
  FloatingButton,
} from './lib';
import SaaSConfig from './config.json';
import { useEffect, useState } from 'react';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const Brand = "FIREACT";

function App() {
  const [userHasSuscription, setHasSuscription] = useState<string>('');
  // merge pathnames
  for (let key in subPathnames) {
    //@ts-ignore
    pathnames[key] = subPathnames[key];
  }

  const config = {
    firebaseConfig: firebaseConfig,
    brand: "FIREACTJS",
    pathnames: pathnames,
    authProviders: authMethods,
    saas: SaaSConfig
  }

  useEffect(() => {
    if (import.meta.env.DEV) {
      const functions = getFunctions(getApp());
      connectFunctionsEmulator(functions, "localhost", 5001);
      connectAuthEmulator(getAuth(), "http://127.0.0.1:9099");
      connectFirestoreEmulator(getFirestore(), '127.0.0.1', 8080);
    }
  }, []);

  return (
    <FireactProvider config={config}>
      <AuthProvider firebaseConfig={firebaseConfig} brand={Brand}>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthRoutes loader={<Loader size="large" />} />} >
            { Boolean(userHasSuscription)
              ?
              <Route
                element={
                  <AppTemplate logo={<Logo size="large" />}
                    toolBarMenu={<UserMenu />}
                    drawerMenu={<SubscriptionProvider
                      loader={<Loader size="large" />}
                      setHasSuscription={setHasSuscription}
                      userSuscription={userHasSuscription}
                      renderChildren={true}
                    >
                      <SubscriptionMenu />
                    </SubscriptionProvider>} 
                  />
                }
              >
                <Route path={pathnames.ListSubscriptions} element={<ListSubscriptions loader={<Loader size="large" />} />} />
                <Route path={pathnames.CreateSubscription} element={<CreateSubscription />} />
                <Route path={pathnames.UserProfile} element={<UserProfile />} />
                <Route path={pathnames.UserUpdateEmail} element={<UserUpdateEmail />} />
                <Route path={pathnames.UserUpdateName} element={<UserUpdateName />} />
                <Route path={pathnames.UserUpdatePassword} element={<UserUpdatePassword />} />
                <Route path={pathnames.UserDelete} element={<UserDelete />} />
              </Route>
              :
              <Route>
              <Route path={pathnames.ListSubscriptions} element={<ListSubscriptions loader={<Loader size="large" />} />} />
              <Route path={pathnames.CreateSubscription} element={<CreateSubscription />} />
              <Route path={pathnames.UserProfile} element={<UserProfile />} />
              <Route path={pathnames.UserUpdateEmail} element={<UserUpdateEmail />} />
              <Route path={pathnames.UserUpdateName} element={<UserUpdateName />} />
              <Route path={pathnames.UserUpdatePassword} element={<UserUpdatePassword />} />
              <Route path={pathnames.UserDelete} element={<UserDelete />} />
              </Route>
            }
              <Route
                path={pathnames.Subscription}
                element={
                  <SubscriptionProvider
                    setHasSuscription={setHasSuscription}
                    userSuscription={userHasSuscription}
                    loader={<Loader size="large" />}
                  />
                }
              >
                {/* @ts-ignore */}
                <Route element={<AppTemplate logo={<Logo size="large" />} toolBarMenu={<UserMenu />} drawerMenu={<SubscriptionMenu />} />}>

                  <Route element={<PermissionRouter permissions={["access"]} />} >
                    <Route path={pathnames.Subscription + "/create"} element={<CreateExam />} />
                    <Route element={<FloatingButton path={pathnames.Subscription.replace(':subscriptionId', userHasSuscription) + '/create'} />}>
                      <Route path={pathnames.Subscription + "/"} element={<Dashboard />} />
                      <Route path={pathnames.Metrics} element={<Metrics />} />
                    </Route>
                  </Route>
                  <Route element={<PermissionRouter permissions={["admin"]} />} >
                    <Route element={<FloatingButton path={pathnames.Subscription.replace(':subscriptionId', userHasSuscription) + '/create'} />}>
                      {/* @ts-ignore */}
                      <Route path={pathnames.Settings} element={<Settings loader={<Loader size="large" />} />} />
                      <Route path={pathnames.ListUsers} element={<ListUsers loader={<Loader size="large" />} />} />
                      <Route path={pathnames.ListInvoices} element={<ListInvoices loader={<Loader size="large" />} />} />
                      <Route path={pathnames.ManagePaymentMethods} element={<ManagePaymentMethods loader={<Loader size="large" />} />} />
                      <Route path={pathnames.UpdateBillingDetails} element={<UpdateBillingDetails loader={<Loader size="large" />} />} />
                      <Route path={pathnames.ChangePlan} element={<ChangePlan />} />
                      <Route path={pathnames.CancelSubscription} element={<CancelSubscription />} />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </Route>
            <Route element={<PublicTemplate />}>
              <Route path={pathnames.SignIn} element={
                <SignIn
                  logo={<Logo size="large" />}
                />
              } />
              <Route path={pathnames.SignUp} element={
                <SignUp
                  logo={<Logo size="large" />}
                />
              } />
              <Route path={pathnames.ResetPassword} element={
                <ResetPassword
                  logo={<Logo size="large" />}
                />
              } />
              <Route path={pathnames.ActionPages} element={
                <ActionPages
                  logo={<Logo size="large" />}
                />
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </FireactProvider>
  )
}

export default App;
