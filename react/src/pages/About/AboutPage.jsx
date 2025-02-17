import { Link, useOutletContext } from 'react-router-dom';
import styles from './AboutPage.module.css';

import knot from '../../assets/images/knot.png';
import seal from '../../assets/images/seal.png';
import signature from '../../assets/images/signature_vertical.png';

// import KnotSVG from '../../assets/images/test.svg';
import KnotSVG from '../../assets/images/test2.svg?react';

const AboutPage = () => {
  const { closeOverlay } = useOutletContext();
  
  return (
    <div className={styles.aboutPage}>
      <div className={styles.knotContainer}>
        <img
          src={knot}
          alt="Knot"
          className={styles.knotImage}  
        />
        <Link
          to=""
          onClick={(e) => {
            e.preventDefault();
            closeOverlay();
          }}
          className={styles.knotButton}
          title="Close Scroll"
        >
          <KnotSVG 
            className={styles.knotOverlay} />
        </Link>
      </div>
      <div className={styles.background}>
        <div className={styles.content}>
          <h1>About Page</h1>
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <p>Hi</p>
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <p>Hi</p>
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <p>Hi</p>
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <p>Hi</p>
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <p>Hi</p>
          <p>Hi</p>
          <br />
          <p>Hi</p>
          <p>Hi</p>
          <p>Hi</p>
          <div className={styles.dojang}>
            <img 
              src={signature} 
              alt="Signature" 
              title="Signature"
              className={styles.signature} />
            <img 
              src={seal} 
              alt="Seal" 
              title="Signature"
              className={styles.seal} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
