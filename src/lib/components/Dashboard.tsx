import { SetPageTitle } from "@fireactjs/core";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import pathnamesJson from "../pathnames.json";

const pathNames: typeof pathnamesJson = pathnamesJson;

export const Dashboard = () => {
  const { suscriptionId } = useParams();
  const navigate = useNavigate();
  return (
    <Container maxWidth="lg">
      <SetPageTitle title={"Dashboard"} />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Stack direction="row" spacing={10}>
          <Paper>
            <Box p={5}>
              <Stack spacing={2}>
                <Typography>
                  10
                </Typography>
                <Typography>
                  Exams
                </Typography>
              </Stack>
            </Box>
          </Paper>
          <Paper>
            <Box p={5}>
              <Stack spacing={2}>
                <Typography>
                  72
                </Typography>
                <Typography>
                  Completed
                </Typography>
              </Stack>
            </Box>
          </Paper>
          <Paper>
            <Box p={5}>
              <Stack spacing={2}>
                <Typography>
                  144
                </Typography>
                <Typography>
                  Students
                </Typography>
              </Stack>
            </Box>
          </Paper>
        </Stack>
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        marginTop="5rem"
      >
        <Button
          variant="contained"
          onClick={() => {
            navigate(pathNames.Subscription.replace(':suscriptionId', suscriptionId!) + '/create');
          }}
        >
          Create Exam
        </Button>
      </Box>
    </Container>
  )
}
