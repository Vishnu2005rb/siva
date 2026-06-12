import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { showToast } = useAuth();
  
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isBuyNow, setIsBuyNow] = useState(() => {
    const saved = localStorage.getItem('isBuyNow');
    return saved === 'true';
  });

  const [buyNowCart, setBuyNowCart] = useState(() => {
    const saved = localStorage.getItem('buyNowCart');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist states
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('isBuyNow', isBuyNow.toString());
  }, [isBuyNow]);

  useEffect(() => {
    localStorage.setItem('buyNowCart', JSON.stringify(buyNowCart));
  }, [buyNowCart]);

  // Add to cart
  const addToCart = (product, quantity = 1) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      showToast(`${quantity}x ${product.name} added to cart!`);
    } else {
      showToast('Product added to cart!');
    }

    setCart(prevCart => {
      const existingInPrev = prevCart.find(item => item.id === product.id);
      if (existingInPrev) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    showToast('Item removed from cart', 'success');
  };

  // Update quantity
  const updateQuantity = (productId, change) => {
    const item = cart.find(i => i.id === productId);
    if (item) {
      const newQty = item.quantity + change;
      if (newQty <= 0) {
        showToast('Item removed from cart', 'success');
        setCart(prevCart => prevCart.filter(i => i.id !== productId));
      } else {
        setCart(prevCart => prevCart.map(i =>
          i.id === productId ? { ...i, quantity: newQty } : i
        ));
      }
    }
  };

  // Buy Now flow
  const handleBuyNow = (product, qty = 1, userObj, navigate) => {
    const buyNowItem = [{ ...product, quantity: qty }];
    setBuyNowCart(buyNowItem);
    setIsBuyNow(true);

    if (!userObj) {
      localStorage.setItem('redirectAfterAuth', '/checkout');
      showToast('Please sign up to continue!');
      setTimeout(() => {
        navigate('/register');
      }, 800);
    } else {
      navigate('/checkout');
    }
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setBuyNowCart([]);
    setIsBuyNow(false);
  };

  // Get dynamic current checkout items (either Cart or BuyNowCart)
  const getCheckoutItems = () => {
    return isBuyNow ? buyNowCart : cart;
  };

  // Calculations
  const getSubtotal = () => {
    const items = getCheckoutItems();
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getTax = () => {
    return 0; // matching standard cart.js which sets tax = 0
  };

  const getDelivery = () => {
    return 0; // matching standard cart.js which sets delivery = 0
  };

  const getTotal = () => {
    return getSubtotal() + getDelivery() + getTax();
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      isBuyNow,
      setIsBuyNow,
      buyNowCart,
      setBuyNowCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      handleBuyNow,
      clearCart,
      getCheckoutItems,
      getSubtotal,
      getTax,
      getDelivery,
      getTotal,
      getCartItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
