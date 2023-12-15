import { useContext } from "react";
import { Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExamsIcon from '@mui/icons-material/Quiz';
import MetricsIcon from '@mui/icons-material/BarChart';
import SupportIcon from '@mui/icons-material/Telegram';
//import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { AuthContext, FireactContext } from "@fireactjs/core";
import { checkPermission } from "./utilities";
import { SubscriptionContext } from "./SubscriptionContext";
//import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';

export const SubscriptionMenu = ({ customItems }: any) => {
  const { config } = useContext<any>(FireactContext);
  const pathnames = config.pathnames;
  const { subscription } = useContext(SubscriptionContext);
  const { authInstance } = useContext<any>(AuthContext);
  const defaultPermissions = [];
  const adminPermissions = [];

  for (let permission in config.saas.permissions) {
    if (config.saas.permissions[permission].default) {
      defaultPermissions.push(permission);
    }
    if (config.saas.permissions[permission].admin) {
      adminPermissions.push(permission);
    }
  }

  return (
    <List component="nav">
      {checkPermission(subscription, authInstance.currentUser.uid, defaultPermissions) &&
        <>
          <NavLink
            to={pathnames.Subscription.replace(":subscriptionId", subscription?.id)}
            style={{ textDecoration: 'none' }}
            key="dashboard"
          >
            <ListItemButton>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary={<Typography color="textPrimary">Dashboard</Typography>} />
            </ListItemButton>
          </NavLink>
          <Divider key="dashboard-divider" />
          <NavLink
            to={pathnames.Exams.replace(":subscriptionId", subscription?.id)}
            style={{ textDecoration: 'none' }}
            key="Exams"
          >
            <ListItemButton>
              <ListItemIcon><ExamsIcon /></ListItemIcon>
              <ListItemText primary={<Typography color="textPrimary">Exams</Typography>} />
            </ListItemButton>
          </NavLink>
          <Divider key="exams-divider" />
          <NavLink
            to={pathnames.Metrics.replace(":subscriptionId", subscription?.id)}
            style={{ textDecoration: 'none' }}
            key="metrics"
          >
            <ListItemButton>
              <ListItemIcon><MetricsIcon /></ListItemIcon>
              <ListItemText primary={<Typography color="textPrimary">Metrics</Typography>} />
            </ListItemButton>
          </NavLink>          
        </>
      }
      {customItems}
      {checkPermission(subscription, authInstance.currentUser.uid, adminPermissions) &&
        <>
          {/* @ts-ignore 
          <Divider key="settings-divider" />
          <NavLink
            to={pathnames.Settings.replace(":subscriptionId", subscription?.id)}
            style={{ textDecoration: 'none' }}
            key="settings"
          >
            <ListItemButton>
              <ListItemIcon><SettingsApplicationsIcon /></ListItemIcon>
              <ListItemText primary={<Typography color="textPrimary">Settings</Typography>} />
            </ListItemButton>
          </NavLink>
          <Divider key="user-divider" />
          <NavLink
            to={pathnames.ListUsers.replace(":subscriptionId", subscription?.id)}
            style={{ textDecoration: 'none' }}
            key="users"
          >
            <ListItemButton>
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary={<Typography color="textPrimary">Users</Typography>} />
            </ListItemButton>
          </NavLink>
          */}
          <Divider key="billing-divider" />
          <NavLink
            to={pathnames.ListInvoices.replace(":subscriptionId", subscription?.id)}
            style={{ textDecoration: 'none' }}
            key="billing"
          >
            <ListItemButton>
              <ListItemIcon><MonetizationOnIcon /></ListItemIcon>
              <ListItemText primary={<Typography color="textPrimary">Billing</Typography>} />
            </ListItemButton>
          </NavLink>
        </>
      }
      <Divider key="support-divider" />
      <NavLink
        to="https://t.me/InstantExamAI" 
        target="_blank"
        style={{ textDecoration: 'none' }}
        key="support"
      >
        <ListItemButton>
          <ListItemIcon><SupportIcon /></ListItemIcon>
          <ListItemText primary={<Typography color="textPrimary">Support</Typography>} />
        </ListItemButton>
      </NavLink> 
    </List>
    
  )
}
