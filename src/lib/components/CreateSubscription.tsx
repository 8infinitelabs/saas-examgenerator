import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, FireactContext, SetPageTitle } from "@fireactjs/core";
import { Alert, Box, Container, Paper, Stack, Typography } from "@mui/material";
import { doc, setDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { PricingPlans } from "./PricingPlans";
import { PaymentMethodForm } from "./PaymentMethodForm";
import { BillingDetails } from "./BillingDetails";
import { Plan } from "./types";

export const CreateSubscription = () => {

  const { config } = useContext<any>(FireactContext);
  const { firestoreInstance, functionsInstance } = useContext<any>(AuthContext);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [billingDetails, setBillingDetails] = useState<any>();
  const [selectedPlan, setSelectedPlan] = useState<Plan>();
  const singular = config.saas.subscription?.singular;
  const auth = getAuth();
  const navigate = useNavigate();

  const selectPlan = (plan: Plan) => {
    setProcessing(true);
    setError('');
    if (plan.free) {
      // subscribe to free plans on selection
      const createSubscription = httpsCallable(functionsInstance, 'createSubscription');
      createSubscription({
        planId: plan.id,
        paymentMethodId: null,
        BillingDetails: null
      }).then((res: any) => {
        if (res.data && res.data.subscriptionId) {
          //DTL: I've changed the next step define "project" in the onboarding process
          //navigate(config.pathnames.Settings.replace(":subscriptionId", res.data.subscriptionId));
          navigate(config.pathnames.Subscription.replace(":subscriptionId", res.data.subscriptionId));
        } else {
          setError("Failed to create the " + singular + ".");
          setProcessing(false);
        }
      }).catch(error => {
        setError(error.message);
        setProcessing(false);
      })
    } else {
      // show payment method
      setSelectedPlan(plan);
      setShowPaymentMethod(true);
      setProcessing(false);
    }
  }

  const submitPlan = (paymentMethod: any) => {
    setProcessing(true);
    setError('');
    const createSubscription = httpsCallable(functionsInstance, 'createSubscription');
    let subscriptionId: string;
    createSubscription({
      paymentMethodId: paymentMethod.id,
      planId: selectedPlan?.id,
      billingDetails: billingDetails
    }).then((res: any) => {
      if (res.data && res.data.subscriptionId) {
        subscriptionId = res.data.subscriptionId;
      }
      const pmRef = doc(firestoreInstance, 'users/' + auth!.currentUser!.uid + '/paymentMethods/' + paymentMethod.id);
      return setDoc(pmRef, {
        type: paymentMethod.type,
        cardBrand: paymentMethod.card.brand,
        cardExpMonth: paymentMethod.card.exp_month,
        cardExpYear: paymentMethod.card.exp_year,
        cardLast4: paymentMethod.card.last4
      }, { merge: true });
    }).then(() => {
      if (subscriptionId !== null) {
        //DTL: I've changed the next step define "project" in the onboarding process
        //navigate(config.pathnames.Settings.replace(":subscriptionId", subscriptionId));
        navigate(config.pathnames.Subscription.replace(":subscriptionId", subscriptionId));
      } else {
        setError("Failed to create the " + singular + ".");
        setProcessing(false);
      }
    }).catch(err => {
      setError(err.message);
      setProcessing(false);
    });
  }

  return (
    <Container maxWidth="lg">
      <SetPageTitle title={"Choose a Plan"} />
      <Paper>
        <Box p={5}>
          {showPaymentMethod ? (
            <Stack spacing={3}>
              {paymentStep === 1 &&
                <>
                  <Typography
                    component="h1"
                    variant="h3"
                    align="center"
                    color="text.primary"
                    gutterBottom
                  >
                    Your Billing Details
                  </Typography>
                  {error &&
                    <Alert severity="error">{error}</Alert>
                  }
                  <BillingDetails
                    buttonText={"Continue"}
                    setBillingDetailsObject={(obj: any) => {
                      setBillingDetails(obj);
                      setPaymentStep(2);
                    }}
                    disabled={false}
                    currentBillingDetails={undefined}
                  />
                </>
              }
              {paymentStep === 2 &&
                <>
                  <Typography
                    component="h1"
                    variant="h3"
                    align="center"
                    color="text.primary"
                    gutterBottom
                  >
                    Setup Payment Method
                  </Typography>
                  {error &&
                    <Alert severity="error">{error}</Alert>
                  }
                  <PaymentMethodForm
                    buttonText={"Subscribe"}
                    setPaymentMethod={submitPlan}
                    disabled={processing}
                    billingDetails={undefined}
                  />
                </>

              }

            </Stack>
          ) : (
            <Stack spacing={3}>
              <Typography
                component="h1"
                variant="h3"
                align="center"
                color="text.primary"
                gutterBottom
              >
                Choose a Plan
              </Typography>
              {error &&
                <Alert severity="error">{error}</Alert>
              }
              <div>
                <PricingPlans
                  selectPlan={selectPlan}
                  disabled={processing}
                  paymentMethod={undefined}
                  selectedPlanId={undefined}
                />
              </div>
            </Stack>
          )}
        </Box>
      </Paper>
    </Container>
  )
}
