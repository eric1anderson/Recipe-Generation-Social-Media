import './Footer.css'

const Footer = () => {
    return (
        <div id="footer-container">
            <div id="footer-left">
                <h3 className='footer-title'>Explore</h3>
                <span>Latest Recipes</span>
                <span>Popular Recipes</span>
            </div>
            <div id="footer-right">
                <h3 className='footer-title'>Contach with Us</h3>
                {/* Instagram Page */}
                <div id="social-container">
                    <a 
                        href="https://www.instagram.com/kyle990987/"
                        className='fa fa-instagram social-icon'
                    ></a>

                    {/* Facebook Page */}
                    <a 
                        href="https://www.facebook.com/kyle.wen.12"
                        className='fa fa-facebook social-icon'  
                    ></a>

                    {/* Twitter Page */}
                    <a 
                        href="https://www.facebook.com/kyle.wen.12"
                        className='fa fa-twitter social-icon'  
                    ></a>
                </div> 
            </div>
        </div>
    )
}

export default Footer