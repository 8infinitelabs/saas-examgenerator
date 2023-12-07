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
import { useParams } from "react-router-dom";
import { questionType, chatgptSchema, question } from "./types";

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
  const [exam, setExam] = useState<chatgptSchema[]>([]);
  const [trueOrFalse, setTrueOrFalse] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [numQuestion, setNumQuestions] = useState<number>(2);
  const [numAnswers, setNumAnswers] = useState<number>(2);
  const [name, setName] = useState<string>('');
  //TODO: Add a option for an specific theme
  //TODO: Add some kind of difficulty level
  const prompt =
    `Create a ${category} ${difficulty} level exam with ${numQuestion} questions, and for each question, provide the correct answer, an answer explanation, a question statement, and ${trueOrFalse? 'only true or false' : numAnswers} answer options. Ensure that the generated output follows the specified JSON schema.`;

  const submitExam = () => {
    setProcessing(true);
    setError('');
    const createExam = httpsCallable(functionsInstance, 'createExam');
    let answers: {
      correctAnswer: string,
      answerExplanation: string,
    }[] = [];
    let questions: question[] = [];
    exam.forEach((q) => {
      questions.push(q.questionData);
      answers.push({
        correctAnswer: q.correctAnswer,
        answerExplanation: q.answerExplanation,
      });
    });
    const data: questionType = {
      questions,
      category,
    };
    createExam({
      subscriptionId,
      questions: data,
      answers,
      name,
    }).then((res: any) => {
      setExamUrl(res.data);
      setProcessing(false);
    }).catch((err) => {
      setError(err.message);
      setProcessing(false);
    });
  }

  const createQuesions = async () => {
    setProcessing(true);
    try {
      const createQuestion = httpsCallable(functionsInstance, 'createQuestions');
      let result: any = await createQuestion({
        prompt,
      });
      let data = JSON.parse(result.data[0].message.content);
      const keys = Object.keys(data);
      console.log(keys);
      if (keys[0] !== '0') {
        console.log('got here')
        data = data[keys[0]];
      }
      console.log(result);
      console.log(data);
      setExam(data as chatgptSchema[]);
      setProcessing(false);
    } catch (err: any) {
      setError(err.message);
      console.log(err.message);
      setProcessing(false);
    }
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
              <Alert severity="success">http://localhost:5174/{examUrl}</Alert>
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
              <InputLabel >
                Name of the exam
              </InputLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl >

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
            </FormControl>

            <FormControl>
              <Select
                label="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
              >
                <MenuItem value={'first grade'}>first grade</MenuItem>
                <MenuItem value={'high school'}>high school</MenuItem>
                <MenuItem value={'university'}>university</MenuItem>
              </Select>
            </FormControl>

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
