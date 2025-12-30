import React, { useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useWindowSize from 'hooks/useWindowSize';
import { Layout } from 'components/ui/Layout';
import { getHome, Welcome } from 'components/screens/index';
import { defaultMetaTags } from 'parameters';
import { useAuth } from 'contexts/AuthContext';


interface ServerSideProps {}

const IndexPage: NextPage<ServerSideProps> = (props: ServerSideProps) => {
	const screenSize = useWindowSize();
	const home = getHome({ screenSize });
	const { isAuthenticated, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading) {
			if (isAuthenticated) {
				router.push('/dashboard');
			} else {
				router.push('/login');
			}
		}
	}, [isAuthenticated, loading, router]);

	if (loading) {
		return (
			<Layout>
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
					Loading...
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<Welcome title={home.welcome.title} />
		</Layout>
	);
};

export default IndexPage;

export const getServerSideProps: GetServerSideProps<ServerSideProps> = async () => {
	return {
		props: {

		}
	};
};
