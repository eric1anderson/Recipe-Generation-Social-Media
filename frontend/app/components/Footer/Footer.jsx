import './Footer.css'

const Footer = () => {
    return (
        <div id="footer-container">
            <div id="footer-left">
                <h3 id='footer-left-title'>Explore</h3>
                <span>Latest Recipes</span>
                <span>Popular Recipes</span>
            </div>
            <div id="footer-right">
                <h3 id='footer-right-title'>Contach with Us</h3>
                {/* Instagram Page */}
                <div id="social-container">
                    <a 
                        href="#"
                        className='fa fa-instagram social-icon'
                    ></a>

                    {/* Facebook Page */}
                    <a 
                        href="#"
                        className='fa fa-facebook social-icon'  
                    ></a>

                    {/* Twitter Page */}
                    <a 
                        href="#"
                        className='fa fa-twitter social-icon'  
                    ></a>
                </div> 
            </div>
        </div>
    )
}

export default Footer