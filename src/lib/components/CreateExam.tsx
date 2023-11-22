import React, { useContext, useState } from "react";
import { AuthContext, SetPageTitle } from "@fireactjs/core";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Input,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { httpsCallable } from "firebase/functions";
import { questionType, question } from "./types";
import { useParams } from "react-router-dom";

const minAnswer = 2;
const maxAnswer = 6;
const minQuestion = 2;
const maxQuestion = 10;

export const CreateExam = () => {
  const { functionsInstance } = useContext<any>(AuthContext);
  const { subscriptionId } = useParams();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [examUrl, setExamUrl] = useState<string>('');
  const [questions, setQuestions] = useState<question[]>([]);
  const [trueOrFalse, setTrueOrFalse] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('');
  const [numQuestion, setNumQuestions] = useState<number>(2);
  const [numAnswers, setNumAnswers] = useState<number>(2);
  const prompt =
    `create an ${category} exam with ${numQuestion} question, each question should have ${trueOrFalse? 'only 2 true or false' :numAnswers} answers`;

  const submitExam = () => {
    setProcessing(true);
    setError('');
    console.log('questions in submit', questions)
    const createExam = httpsCallable(functionsInstance, 'createExam');
    const data: questionType = {
     questions,
     category,
    };
    createExam({
      subscriptionId,
      questions: data,
    }).then((res: any) => {
      setExamUrl(res.data);
      setProcessing(false);
    }).catch((err) => {
      setError(err.message);
      setProcessing(false);
    });
  }

  const createQuesions = async () => {
    const createQuestion = httpsCallable(functionsInstance, 'createQuestions');
    const a = await createQuestion({
      prompt,
    });
    console.log('createdQuestion', a);
    setQuestions(a.data as question[]);
  };
  const handleNumberInput = (
    min: number,
    max: number,
    value: number,
    set: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    const newValue = Math.min(Math.max(value, min), max);
    set(newValue);
  };

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
        <Box p={5}>
          <Stack spacing={3}>
            <FormControl
              component='fieldset'
            >
              <legend>Customize your answers</legend>
              <FormControlLabel
                value={trueOrFalse}
                onChange={(_, v) => setTrueOrFalse(v)}
                control={
                  <Checkbox
                  />
                }
                label='the exam only contains true or false questions'
                labelPlacement='end'
              />
            </FormControl>

            <FormControl>
              <Select
                label="Age"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <MenuItem value={'science'}>science</MenuItem>
                <MenuItem value={'math'}>math</MenuItem>
                <MenuItem value={'biology'}>biology</MenuItem>
                <MenuItem value={'algebra'}>algebra</MenuItem>
              </Select>
            </FormControl >

            <FormControl>
              <InputLabel >
                Number of questions
              </InputLabel>
              <Input
                id='range-questions'
                type='number'
                value={numQuestion}
                onChange={(e) => {
                  handleNumberInput(
                    minQuestion,
                    maxQuestion,
                    parseInt(e.target.value),
                    setNumQuestions,
                  );
                }}
              />
            </FormControl >

            <FormControl>
              <InputLabel >
                Number of ansers per questions
              </InputLabel>
              <Input
                id='range-answers'
                type='number'
                value={numAnswers}
                onChange={(e) => {
                  handleNumberInput(
                    minAnswer,
                    maxAnswer,
                    parseInt(e.target.value),
                    setNumAnswers,
                  );
                }}
              />
            </FormControl >

            <FormControl>
              <InputLabel >
                Generated prompt
              </InputLabel>
              <Input
                value={prompt}
                disabled
              />
            </FormControl >

            <Button
              disabled={processing}
              variant="contained"
              onClick={createQuesions}
            >
              Send To OpenAI
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}
