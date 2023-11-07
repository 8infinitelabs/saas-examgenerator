import React, { useContext, useEffect, useState } from "react";
import { useParams, Outlet } from 'react-router-dom';
import { doc, DocumentData, getDoc } from 'firebase/firestore';
import { AuthContext, FireactContext } from "@fireactjs/core";
import { Alert, Box, Container } from "@mui/material";

export const SubscriptionContext = React.createContext<{
  subscription: DocumentData | undefined;
  setSubscription: React.Dispatch<React.SetStateAction<DocumentData | undefined>>| undefined
}>({ subscription: undefined, setSubscription: undefined });

export const SubscriptionProvider = ({ loader }: { loader: JSX.Element }) => {
  const { subscriptionId } = useParams();
  const [subscription, setSubscription] = useState<DocumentData>();
  const { firestoreInstance }: any = useContext(AuthContext);
  const [error, setError] = useState('');
  const { config }: any = useContext(FireactContext);

  useEffect(() => {
    setError('');
    const docRef = doc(firestoreInstance, "subscriptions", subscriptionId || '');

    getDoc(docRef).then(docSnap => {
      if (docSnap.exists()) {
        const sub = docSnap.data();
        sub.id = subscriptionId;
        setSubscription(sub);
      } else {
        // no subscription
        setError("No " + config.saas.subscription?.singular + " matches the ID");
      }
    }).catch(error => {
      setError(error.message);
    })
  }, [subscriptionId, firestoreInstance, config.saas.subscription?.singular, setError]);

  return (
    <>
      {error ? (
        <Box mt={10}>
          <Container maxWidth="sm">
            <Box component="span" m={5} textAlign="center">
              <Alert severity="error" >{error}</Alert>
            </Box>
          </Container>
        </Box>
      ) : (
        <>
          {subscription !== null ? (
            <SubscriptionContext.Provider value={{ subscription, setSubscription }}>
              <Outlet />
            </SubscriptionContext.Provider>
          ) : (
            <Box mt={10}>
              <Container maxWidth="sm">
                <Box component="span" m={5} textAlign="center">
                  {loader}
                </Box>
              </Container>
            </Box>
          )}
        </>
      )}

    </>
  )

}
