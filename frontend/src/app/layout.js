import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/index.css";

import Providers from "./providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Welcome To Proshop",
  description: "We sell the best products for cheap",
  keywords: "electronics, buy electronics, cheap electronics",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-shell">
            <Header />
            <main className="page-section">
              <div className="app-container">{children}</div>
            </main>

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
