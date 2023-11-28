import { useContext, useEffect, useState } from "react";
import { SetPageTitle } from "@fireactjs/core";
import {
  Alert,
  Box,
  Container,
  Paper,
  Stack,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { AuthContext } from "@fireactjs/core";
import { Loader } from "./Loader";
import { collection, DocumentData, getDocs, query, QueryDocumentSnapshot, where } from "firebase/firestore";

export const Metrics = () => {
  const { firestoreInstance } = useContext<any>(AuthContext);
  const { subscriptionId } = useParams();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[]>([]);

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
    return <Loader/>
  }
  return (
    <Container maxWidth="lg">
      <SetPageTitle title={"Metrics"} />
      <Paper>
        <Box p={5}>
          <Stack spacing={3}>
            {metrics.map((data) => {
              const examId = data.get('examId');
              const message = JSON.stringify(data.data(), null, 4);
              return <Alert key={examId} severity="info">{message}</Alert>
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
