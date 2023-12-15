import { SetPageTitle } from "@fireactjs/core";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";


export const Exams = () => {
  return (
    <Container maxWidth="lg">
      <SetPageTitle title={"Exams"} />
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
                  Exams
                </Typography>
              </Stack>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Container>
  )
}
