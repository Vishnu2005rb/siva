import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

export default function ProductCard({ product }) {

  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [imageError, setImageError] = useState(false);


  const generateStars = (rating) => {

    const stars = [];

    const fullStars = Math.floor(rating);

    const halfStar = rating % 1 !== 0;


    for (let i = 0; i < fullStars; i++) {

      stars.push(
        <i
          key={`full-${i}`}
          className="fas fa-star">
        </i>
      );

    }


    if (halfStar) {

      stars.push(
        <i
          key="half"
          className="fas fa-star-half-alt">
        </i>
      );

    }


    return stars;

  };



  const handleCardClick = () => {

    navigate(`/product/${product.id}`);

  };



  return (

    <div className="product-card">


      <div
        className="product-image"
        onClick={handleCardClick}
        style={{ cursor: "pointer" }}
      >


        {!imageError && product.image ? (

          <img

            src={optimizeCloudinaryUrl(product.image?.startsWith('http') ? product.image : `/${product.image}`)}

            alt={`${product.name} - NK Dairy Products`}

            loading="lazy"

            onError={() =>
              setImageError(true)
            }

          />


        ) : (


          <div
            className="product-image-fallback"
            style={{
              display: "flex"
            }}
          >

            <i className="fas fa-jar"></i>

          </div>


        )}


      </div>



      <div className="product-badge">

        100% Pure

      </div>



      <div className="product-info">


        <h3
          onClick={handleCardClick}
          style={{ cursor: "pointer" }}
        >

          {product.name}

        </h3>


        <p>
          {product.description}
        </p>



        <div className="product-rating">

          <span className="stars">

            {generateStars(product.rating)}

          </span>

          <span>
            ({product.rating})
          </span>

        </div>




        <div className="product-footer">


          <span className="product-price">

            ₹{product.price}

          </span>



          <div className="product-btn-group">


            <button

              className="btn-add-cart"

              onClick={(e) => {

                e.stopPropagation();

                addToCart(product);

              }}

            >

              <i className="fas fa-cart-plus"></i>

              {" "}Add to Cart

            </button>




            <button

              className="btn-buy-now"

              onClick={handleCardClick}

            >

              <i className="fas fa-bolt"></i>

              {" "}Buy Now

            </button>


          </div>


        </div>


      </div>


    </div>

  );

}