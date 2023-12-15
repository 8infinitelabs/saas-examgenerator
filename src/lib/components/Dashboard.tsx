import { useContext, useEffect, useState } from "react";
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
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { AuthContext } from "@fireactjs/core";
import pathnamesJson from "../pathnames.json";

const pathNames: typeof pathnamesJson = pathnamesJson;
type Metrics = {
  completed: number;
  students: number;
  exams: number;
};

type studentType = {
  answers: { value: string, isCorrect: boolean }[],
  correctAnswers: number
  user: {
    email: string,
    name: string,
    photoURL: string,
    uid: string,
  },
}

// @ts-ignore 
type MetricsDocs = {
  timesFailed: number,
  examId: string,
  subscriptionId: string,
  students: {
    [key: string]: studentType,
  },
  timesPassed: number,
  timesTaken: number,
  examLength: number,
}

export const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<Metrics>({
    completed: 0,
    students: 0,
    exams: 0,
  });
  const { firestoreInstance } = useContext<any>(AuthContext);

  console.log(error);
  console.log(loading);

  const { subscriptionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      setLoading(true);
      const metricsRef = collection(firestoreInstance, '/examMetrics');
      const metricsQuery = query(metricsRef, where('subscriptionId', '==', subscriptionId));
      getDocs(metricsQuery).then((res) => {
        if (res.empty) {
          return undefined;
        }
        const data = res.docs;
        const exams = data.length;
        setMetrics({
          exams,
          completed: 0,
          students: 0,
        })
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [firestoreInstance, subscriptionId]);

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
                  {metrics.exams}
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
                  {metrics.completed}
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
                  {metrics.students}
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
            navigate(pathNames.Subscription.replace(':subscriptionId', subscriptionId!) + '/create');
          }}
        >
          Create Exam
        </Button>
      </Box>
    </Container>
  )
}
