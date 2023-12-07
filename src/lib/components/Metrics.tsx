import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SetPageTitle } from "@fireactjs/core";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Container,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ClearIcon from '@mui/icons-material/Clear';
import { AuthContext } from "@fireactjs/core";
import {
  collection,
  DocumentData,
  getDocs,
  query,
  QueryDocumentSnapshot,
  where,
} from "firebase/firestore";
import { Loader } from "./Loader";

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
type metric = {
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

export const Metrics = () => {
  const { firestoreInstance } = useContext<any>(AuthContext);
  const { subscriptionId } = useParams();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[]>([]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50, },
    { field: 'name', headerName: 'Name', width: 200 },
    {
      field: 'answers',
      headerName: 'Answers',
      width: 200,
      // @ts-ignore
      valueFormatter: (data: any) => {
        const value: { value: string, isCorrect: boolean }[] = data.value;
        const onlyAnswers = value.map((item) => item.value);
        return onlyAnswers.join(', ');
      },
    },
    { field: 'correctAnswers', headerName: 'Correct Answers', type: 'number', width: 130, },
    { field: 'score', headerName: 'Score', type: 'number', width: 130, },
  ];

  useEffect(() => {
    try {
      setProcessing(true);
      const metricsRef = collection(firestoreInstance, '/examMetrics');
      const metricsQuery = query(metricsRef, where('subscriptionId', '==', subscriptionId));
      getDocs(metricsQuery).then((data) => {
        console.log(data.metadata);
        console.log(data.size);
        console.log(data.docs);
        if (!data.empty) {
          setMetrics(data.docs);
        }
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }, [firestoreInstance, subscriptionId]);

  if (processing) {
    return <Loader />
  }
  return (
    <Container maxWidth="lg">
      <SetPageTitle title={"Metrics"} />
      <Paper>
        <Box p={5}>
          <Stack spacing={3}>
            {metrics.map((data) => {
              const examId = data.get('examId');
              const name = data.get('name');
              const metric: metric = data.data() as any;
              const students = Object.keys(metric.students);
              const rows = students.map((id) => {
                return {
                  id,
                  name: metric.students[id].user.name,
                  correctAnswers: metric.students[id].correctAnswers,
                  score: parseInt(((metric.students[id].correctAnswers / metric.examLength) * 10).toFixed(0)),
                  answers: metric.students[id].answers,
                }
              });
              return (
                <Accordion key={examId}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id={examId}
                  >
                    <Typography>
                      Exam: {name} number of questions: {metric.examLength} |&nbsp;
                      <Link target='_blank' href={`http://localhost:5174/${examId}`}>
                        http://localhost:5174/{examId}
                      </Link>
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>

                    <Typography>
                      taken: {metric.timesTaken} | passed: {metric.timesPassed} | failed: {metric.timesFailed}
                    </Typography>
                    <div style={{ height: 400, width: '100%' }}>
                      <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{
                          pagination: {
                            paginationModel: { page: 0, pageSize: 5 },
                          },
                        }}
                        pageSizeOptions={[5, 10]}
                      />
                    </div>

                    {students.map((id) => {
                      const student: studentType = metric.students[id];
                      const answers = student.answers.map((answer) => (
                        <Typography>
                          {answer.value} | {answer.isCorrect
                            ? <CheckBoxIcon color='success' />
                            : <ClearIcon color='error' />}
                        </Typography>
                      ));
                      return (
                        <Accordion key={id}>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id={id}
                          >
                            <Typography>
                              Answers of: {student.user.name}
                            </Typography>
                          </AccordionSummary>

                          <AccordionDetails>
                            <Grid>
                              {answers}
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </AccordionDetails>
                </Accordion>
              );
            })}
            {error &&
              <Alert severity="error">{error}</Alert>
            }
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}
