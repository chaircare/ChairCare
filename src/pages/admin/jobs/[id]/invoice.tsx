import { NextPage } from 'next';
import { useRouter } from 'next/router';

const JobInvoicePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Invoice for Job {id}</h1>
      <p>Invoice functionality is under development.</p>
    </div>
  );
};

export default JobInvoicePage;