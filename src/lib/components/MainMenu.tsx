import { Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { FireactContext } from "@fireactjs/core";

export const MainMenu = ({ customItems }: { customItems?: JSX.Element }) => {
  const { config } = useContext<any>(FireactContext);
  const location = useLocation();
  const pathnames = config.pathnames;
  const profileUrl = pathnames.UserProfile;
  return (
    <List component="nav">
      <NavLink to="/" style={{ textDecoration: 'none' }} key="home">
        <ListItemButton>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText
            primary={
              <Typography color="textPrimary">
                { location.pathname === '/create' ? 'Choose Plan' : 'Home' }
              </Typography>
            }
          />
        </ListItemButton>
      </NavLink>
      {customItems}
      {profileUrl && [
        <Divider key="profile-divider" />,
        <NavLink to={profileUrl} style={{ textDecoration: 'none' }} key="profile">
          <ListItemButton>
            <ListItemIcon><AccountBoxIcon /></ListItemIcon>
            <ListItemText primary={<Typography color="textPrimary">My Profile</Typography>} />
          </ListItemButton>
        </NavLink>
      ]}
    </List>
  )
}
