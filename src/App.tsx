import './App.css';
import firebaseConfig from "./firebaseConfig.json";
import {
  pathnames,
  AppTemplate,
  AuthProvider,
  AuthRoutes,
  MainMenu,
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
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { CircularProgress, Box } from '@mui/material';
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
  UpdateBillingDetails
} from './lib';
import SaaSConfig from './config.json';
import { useEffect } from 'react';

const Brand = "FIREACT";

const Logo = ({ size, color }: { size: string, color?: string }) => {
  const logoColor = color || 'warning';
  return (
    //@ts-ignore
    <LocalFireDepartmentIcon color={logoColor} fontSize={size} />
  );
}

const Loader = ({ size }: { size: string }) => {
  let cpSize = "35px";
  switch (size) {
    case "small":
      cpSize = "30px";
      break;
    case "medium":
      cpSize = "35px";
      break;
    case "large":
      cpSize = "45px";
      break;
    default:
      cpSize = "35px";
      break;
  }
  return (
    <Box sx={{ display: 'flex', justifyContent: "center", alignItems: "center" }}>
      <CircularProgress color="warning" size={cpSize} />
      <div style={{ position: "absolute" }}>
        <Logo size={size} />
      </div>
    </Box>
  );
}

function App() {
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
    const functions = getFunctions(getApp());
    connectFunctionsEmulator(functions, "localhost", 5001);
  }, []);

  return (
    <FireactProvider config={config}>
      <AuthProvider firebaseConfig={firebaseConfig} brand={Brand}>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthRoutes loader={<Loader size="large" />} />} >
              <Route element={<AppTemplate logo={<Logo size="large" />} toolBarMenu={<UserMenu />} drawerMenu={<MainMenu />} />}>
                <Route path={pathnames.ListSubscriptions} element={<ListSubscriptions loader={<Loader size="large" />} />} />
                <Route path={pathnames.CreateSubscription} element={<CreateSubscription />} />
                <Route path={pathnames.UserProfile} element={<UserProfile />} />
                <Route path={pathnames.UserUpdateEmail} element={<UserUpdateEmail />} />
                <Route path={pathnames.UserUpdateName} element={<UserUpdateName />} />
                <Route path={pathnames.UserUpdatePassword} element={<UserUpdatePassword />} />
                <Route path={pathnames.UserDelete} element={<UserDelete />} />
              </Route>

              <Route path={pathnames.Subscription} element={<SubscriptionProvider loader={<Loader size="large" />} />} >
                {/* @ts-ignore */}
                <Route element={<AppTemplate logo={<Logo size="large" />} toolBarMenu={<UserMenu />} drawerMenu={<SubscriptionMenu />} />}>
                  <Route element={<PermissionRouter permissions={["access"]} />} >
                    <Route path={pathnames.Subscription + "/"} element={<div>Home</div>} />
                  </Route>
                  <Route element={<PermissionRouter permissions={["admin"]} />} >
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
