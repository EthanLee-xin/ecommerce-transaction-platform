import { Container, Row, Col } from 'react-bootstrap';
import type { ReactNode } from 'react';

type FormContainerProps = {
  children: ReactNode;
};

const FormContainer = ({ children }: FormContainerProps) => {
  return (
    <Container>
      <Row className='justify-content-md-center'>
        <Col xs={12} md={6}>
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default FormContainer;
