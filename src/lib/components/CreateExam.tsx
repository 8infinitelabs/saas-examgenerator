import { useContext, useState } from "react";
import { AuthContext, SetPageTitle } from "@fireactjs/core";
import { Alert, Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { httpsCallable } from "firebase/functions";
import { question } from "./types";
import { SubscriptionContext } from "./SubscriptionContext";

export const CreateExam = () => {
  const { functionsInstance } = useContext<any>(AuthContext);
  const { subscriptionId } = useContext<any>(SubscriptionContext);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [examUrl, setExamUrl] = useState<string>('');

  const submitExam = () => {
    setProcessing(true);
    setError('');
    const questions: question[] = [
      {
        category: "testing",
        type: "binary",
        question: "Is this working?",
        correctAnswer: "true",
      },
      {
        category: "testing",
        type: "binary",
        question: "Is this really working?",
        correctAnswer: "true",
      }
    ];
    const createExam = httpsCallable(functionsInstance, 'createExam');
    createExam({
      subscriptionId,
      questions,
    }).then((res: any) => {
      setExamUrl(res.data);
      setProcessing(false);
    }).catch((err) => {
      setError(err.message);
      setProcessing(false);
    });
  }

  return (
    <Container maxWidth="lg">
      <SetPageTitle title={"Create Exam"} />
      <Paper>
        <Box p={5}>
          <Stack spacing={3}>
            <Typography
              component="h1"
              variant="h3"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Create Debug Exam
            </Typography>
            <Button
              disabled={processing}
              variant="contained"
              onClick={submitExam}
            >
              Create
            </Button>
            {error &&
              <Alert severity="error">{error}</Alert>
            }
            {examUrl &&
              <Alert severity="success">http://localhost:porthere/{examUrl}</Alert>
            }
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}
