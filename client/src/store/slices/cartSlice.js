import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  items: [],
  isOpen: false,
  status: "ACTIVE",
  createdAt: new Date().toISOString(),
  couponCode: null,
  totalAmount: 0,
  depositAmount: 0,
  rentAmount: 0,
  discountAmount: 0,
  finalPrice: 0,
  checkoutComplete: false,
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isOpen = !state.isOpen
    },
    addItem: (state, action) => {
      const { product, quantity = 1 } = action.payload
      const existingItem = state.items.find((item) => item.product.id === product.id)

      if (existingItem) {
        existingItem.quantity += quantity
        existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity
      } else {
        const depositAmount = product.depositAmount || product.price * 0.3
        const rentAmount = product.rentAmount || product.price * 0.7

        state.items.push({
          id: Date.now().toString(),
          product,
          quantity,
          unitPrice: product.price,
          depositAmount,
          rentAmount,
          totalPrice: product.price * quantity,
        })
      }

      // Recalculate totals
      state.totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0)
      state.depositAmount = state.items.reduce((sum, item) => sum + item.depositAmount * item.quantity, 0)
      state.rentAmount = state.items.reduce((sum, item) => sum + item.rentAmount * item.quantity, 0)
      state.finalPrice = state.totalAmount - state.discountAmount
    },
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload
      const item = state.items.find((item) => item.id === itemId)

      if (item) {
        item.quantity = quantity
        item.totalPrice = item.unitPrice * quantity

        // Recalculate totals
        state.totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0)
        state.depositAmount = state.items.reduce((sum, item) => sum + item.depositAmount * item.quantity, 0)
        state.rentAmount = state.items.reduce((sum, item) => sum + item.rentAmount * item.quantity, 0)
        state.finalPrice = state.totalAmount - state.discountAmount
      }
    },
    removeItem: (state, action) => {
      const itemId = action.payload
      state.items = state.items.filter((item) => item.id !== itemId)

      // Recalculate totals
      state.totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0)
      state.depositAmount = state.items.reduce((sum, item) => sum + item.depositAmount * item.quantity, 0)
      state.rentAmount = state.items.reduce((sum, item) => sum + item.rentAmount * item.quantity, 0)
      state.finalPrice = state.totalAmount - state.discountAmount
    },
    applyCoupon: (state, action) => {
      const couponCode = action.payload
      state.couponCode = couponCode

      // In a real application, you would validate the coupon code
      // and apply the corresponding discount.
      // For this example, we'll just apply a 10% discount.
      const discountRate = 0.1
      state.discountAmount = state.totalAmount * discountRate
      state.finalPrice = state.totalAmount - state.discountAmount
    },
    proceedToCheckout: (state) => {
      state.isOpen = false
      state.status = "PROCESSING"
    },
    completeCheckout: (state) => {
      state.checkoutComplete = true
      state.status = "COMPLETED"
      // In a real application, you would create an order and clear the cart
      // For this example, we'll just mark the checkout as complete
    },
    clearCart: (state) => {
      return initialState
    },
  },
})

export const {
  toggleCart,
  addItem,
  updateQuantity,
  removeItem,
  applyCoupon,
  proceedToCheckout,
  completeCheckout,
  clearCart,
} = cartSlice.actions

// Selectors
export const selectCartOpen = (state) => state.cart.isOpen
export const selectCartItems = (state) => state.cart.items
export const selectCartData = (state) => state.cart

export default cartSlice.reducer
