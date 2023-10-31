import { useContext } from "react";
import { SubscriptionContext } from "./SubscriptionContext";
import { checkPermission } from "./utilities";
import { Outlet } from 'react-router-dom';
import { Alert } from "@mui/material";
import { AuthContext } from "@fireactjs/core";

export const PermissionRouter = ({ permissions }: any) => {
  const { subscription } = useContext(SubscriptionContext);
  const { authInstance } = useContext<any>(AuthContext);

  return (
    <>
      {checkPermission(subscription, authInstance.currentUser.uid, permissions) ? (
        <Outlet />
      ) : (
        <Alert severity="error">No premission to access.</Alert>
      )}
    </>
  )
}
