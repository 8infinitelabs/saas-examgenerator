import { useContext, useEffect, useState } from "react";
import "firebase/compat/firestore";
import { AuthContext, FireactContext } from "@fireactjs/core";
import { SubscriptionContext } from "./SubscriptionContext";
import { Alert, Button, Grid, Paper, Box, Container, Typography, Stack } from "@mui/material";
import currencies from "./currencies.json";
import { PaginationTable } from "./PaginationTable";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

interface invoice {
  id: string,
  total: string,
  subTotal: string,
  tax: string,
  amountPaid: string,
  created: string,
  hostedInvoiceUrl: string,
  currency: string
  status: any,
  amountCol: JSX.Element,
  statusCol: JSX.Element,
  urlCol: JSX.Element,
};

export const ListInvoices = ({ loader }: { loader: JSX.Element }) => {

  const [loaded, setLoaded] = useState(false);
  const { subscription } = useContext(SubscriptionContext)
  const { firestoreInstance } = useContext<any>(AuthContext);
  const [invoices, setInvoices] = useState<invoice[]>([]);
  const [error, setError] = useState<string>('');

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<invoice[]>([]);

  const { config } = useContext<any>(FireactContext);

  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setError('');
    setLoaded(false);
    const invoicesRef = collection(firestoreInstance, 'subscriptions/' + subscription?.id + "/invoices");
    const q = query(invoicesRef, orderBy('created', 'desc'));
    getDocs(q).then(invoicesSnapshot => {
      const records: invoice[] = [];
      invoicesSnapshot.forEach(invoice => {
        records.push({
          'id': invoice.id,
          'total': (invoice.data().total / 100).toFixed(2),
          'subTotal': (invoice.data().subTotal / 100).toFixed(2),
          'tax': ((invoice.data().tax || 0) / 100).toFixed(2),
          'amountPaid': (Math.round(invoice.data().amountPaid / 100)).toFixed(2),
          'created': (new Date(invoice.data().created * 1000)).toLocaleString(),
          'hostedInvoiceUrl': invoice.data().hostedInvoiceUrl,
          'currency': invoice.data().currency,
          'status': invoice.data().status,
          //@ts-ignore
          'amountCol': <>{currencies[invoice.data().currency].sign}{(invoice.data().total / 100).toFixed(2)}</>,
          'statusCol': <>{invoice.data().status.toUpperCase()}</>,
          'urlCol': invoice.data().hostedInvoiceUrl ? (
            <Button href={invoice.data().hostedInvoiceUrl} rel="noreferrer" target="_blank" variant="contained" size="small">View Invoice</Button>
          ) : (<></>)
        })
      })
      setTotal(records.length);
      setInvoices(records);
      setLoaded(true);
    }).catch(err => {
      setError(err.message);
      setLoaded(true);
    });
  }, [firestoreInstance, subscription?.id]);

  useEffect(() => {
    const startIndex = page * pageSize;
    const rows = [];
    for (let i = startIndex; i < invoices.length; i++) {
      const invoice = invoices[i];
      if (i >= startIndex + pageSize) {
        break;
      }
      rows.push(invoice);
    }
    if (rows.length > 0) {
      setRows(rows);
    }
    window.scrollTo(0, 0);
  }, [page, pageSize, invoices]);

  return (
    <>
      {loaded ? (
        <Container maxWidth="xl">
          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Paper>
              <Box p={2}>
                <Grid container direction="row" justifyContent="space-between" alignItems="center">
                  <Grid item>
                    <Typography component="h1" variant="h4">Invoice List</Typography>
                  </Grid>
                  <Grid item textAlign="right">
                    {subscription?.ownerId === auth!.currentUser!.uid && <Stack direction="row-reverse" spacing={1} mt={2}>
                      <Button
                        color="error"
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          navigate(config.pathnames.CancelSubscription.replace(":subscriptionId", subscription?.id));
                        }}
                      >
                        Cancel Subscription
                      </Button>
                      <Button
                        color="info"
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          navigate(config.pathnames.ChangePlan.replace(":subscriptionId", subscription?.id))
                        }}
                      >
                        Change Plan
                      </Button>
                      <Button
                        color="info"
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          navigate(config.pathnames.ManagePaymentMethods.replace(":subscriptionId", subscription?.id))
                        }}
                      >
                        Update Payment Method
                      </Button>
                      <Button
                        color="info"
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          navigate(config.pathnames.UpdateBillingDetails.replace(":subscriptionId", subscription?.id))
                        }}
                      >
                        Update Billing Details
                      </Button>
                    </Stack>}
                  </Grid>
                </Grid>
              </Box>
              <Box p={2}>
                <PaginationTable columns={[
                  { name: "Invoice ID", field: "id", style: { width: '30%' } },
                  { name: "Amount", field: "amountCol", style: { width: '15%' } },
                  { name: "Status", field: "statusCol", style: { width: '10%' } },
                  { name: "Invoice Date", field: "created", style: { width: '30%' } },
                  { name: "Invoice URL", field: "urlCol", style: { width: '15%' } }
                ]}
                  rows={rows}
                  totalRows={total}
                  pageSize={pageSize}
                  page={page}
                  handlePageChane={(_: any, p: any) => {
                    setPage(p);
                  }}
                  handlePageSizeChange={(e: any) => {
                    setPage(0);
                    setPageSize(e.target.value);
                  }}
                />
              </Box>
            </Paper>
          )}
        </Container>
      ) : (
        <>{loader}</>
      )}
    </>
  )
}
