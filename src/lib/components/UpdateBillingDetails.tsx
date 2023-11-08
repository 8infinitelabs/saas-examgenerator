import { useContext, useEffect, useState } from "react";
import { AuthContext, SetPageTitle, FireactContext } from "@fireactjs/core";
import { Alert, Box, Container, Paper, Typography, Grid, Button } from "@mui/material";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { BillingDetails } from "./BillingDetails";
import { SubscriptionContext } from "./SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";

export const UpdateBillingDetails = ({ loader }: { loader: JSX.Element }) => {

  const title = "Update Billing Details";
  const { subscription } = useContext(SubscriptionContext);
  const [loaded, setLoeaded] = useState(false);
  const [error, setError] = useState<string>('');
  const auth = getAuth();
  const { firestoreInstance } = useContext<any>(AuthContext);
  const { config } = useContext<any>(FireactContext);
  const navigate = useNavigate();
  const [billingDetails, setBillingDetails] = useState<any>();
  const [processing, setProcessing] = useState(false);
  const [succss, setSuccess] = useState(false);
  const { functionsInstance } = useContext<any>(AuthContext);

  useEffect(() => {
    setLoeaded(false);
    setError('');
    getDoc(doc(firestoreInstance, 'users/' + auth.currentUser!.uid)).then(doc => {
      setBillingDetails(doc.data()!.billingDetails);
      setLoeaded(true);
    }).catch(err => {
      setError(err.message);
      setLoeaded(true);
    })
  }, [auth.currentUser!.uid, firestoreInstance]);

  return (
    <>
      {loaded ? (
        <Container maxWidth="xl">
          <SetPageTitle title={title} />
          <Paper>
            <Box p={2}>
              <Grid container direction="row" justifyContent="space-between" alignItems="center">
                <Grid item>
                  <Typography component="h1" variant="h4">{title}</Typography>
                </Grid>
                <Grid item textAlign="right">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(config.pathnames.ListInvoices.replace(":subscriptionId", subscription?.id))}
                  >
                    Invoice List
                  </Button>
                </Grid>
              </Grid>
            </Box>
            {error ? (
              <Box p={2}>
                <Alert severity="error">{error}</Alert>
              </Box>
            ) : (
              <>
                {succss === true &&
                  <Box p={2}>
                    <Alert severity="success">Billing details have been updated successfully.</Alert>
                  </Box>
                }
                <Box p={2}>
                  <BillingDetails
                    disabled={processing}
                    buttonText={"Update"}
                    currentBillingDetails={billingDetails}
                    setBillingDetailsObject={(obj: any) => {
                      setProcessing(true);
                      setSuccess(false);
                      const changeBillingDetails = httpsCallable(functionsInstance, 'changeBillingDetails');
                      changeBillingDetails({ billingDetails: obj }).then(() => {
                        setBillingDetails(obj);
                        setProcessing(false);
                        setSuccess(true);
                      }).catch(error => {
                        setError(error.message);
                        setProcessing(false);
                        setSuccess(false);
                      })
                    }}
                  />
                </Box>
              </>
            )}
          </Paper>
        </Container>
      ) : (
        <>{loader}</>
      )}
    </>
  )
}
