import { Helmet } from 'react-helmet-async';

type MetaProps = {
  title?: string;
  description?: string;
  keywords?: string;
};

const APP_NAME = 'vipshop-ecommerce';

const Meta = ({ title = '', description = '', keywords = '' }: MetaProps) => {
  const pageTitle = title ? `${title} | ${APP_NAME}` : APP_NAME;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      {description ? <meta name='description' content={description} /> : null}
      {keywords ? <meta name='keywords' content={keywords} /> : null}
    </Helmet>
  );
};

export default Meta;
