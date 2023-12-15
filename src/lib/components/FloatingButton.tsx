import { Fab } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';

export function FloatingButton({ path }: { path: string }) {

  const navigate = useNavigate();
  return (
    <>
      <Outlet />
      <Fab
        color="primary"
        aria-label="create exam"
        onClick={() => {
          navigate(path);
        }}
        style={{
          margin: 0,
          top: 'auto',
          right: 20,
          bottom: 40,
          left: 'auto',
          position: 'fixed',
        }}
      >
        <AddIcon />
      </Fab>
    </>
  );
}
