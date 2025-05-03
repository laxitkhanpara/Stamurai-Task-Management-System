import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Mock data for demonstration
const mockRentals = [
  {
    id: "1",
    orderId: "ORD-12345",
    product: {
      id: "101",
      name: "Navratri Chaniya Choli - Red",
      description:
        "Beautiful traditional Chaniya Choli for Navratri celebrations. Features intricate embroidery and mirror work.",
      imageUrl: "/placeholder.svg?height=400&width=400",
      category: "Traditional Wear",
      size: "M",
      color: "Red",
      price: 150,
    },
    rentedDate: "2023-10-01T00:00:00Z",
    dueDate: "2023-10-15T00:00:00Z",
    returnedDate: null,
    rentalDuration: 14,
    status: "ACTIVE",
    depositAmount: 45,
    rentAmount: 105,
    depositPaid: true,
    rentPaid: false,
  },
  {
    id: "2",
    orderId: "ORD-12346",
    product: {
      id: "102",
      name: "Wedding Sherwani - Royal Blue",
      description: "Elegant royal blue sherwani with golden embroidery, perfect for wedding ceremonies.",
      imageUrl: "/placeholder.svg?height=400&width=400",
      category: "Wedding Wear",
      size: "L",
      color: "Blue",
      price: 200,
    },
    rentedDate: "2023-09-15T00:00:00Z",
    dueDate: "2023-09-25T00:00:00Z",
    returnedDate: "2023-09-24T00:00:00Z",
    rentalDuration: 10,
    status: "RETURNED",
    depositAmount: 60,
    rentAmount: 140,
    depositPaid: true,
    rentPaid: true,
  },
  {
    id: "3",
    orderId: "ORD-12347",
    product: {
      id: "103",
      name: "Designer Saree - Green",
      description:
        "Designer green saree with zari work and embellishments, suitable for parties and special occasions.",
      imageUrl: "/placeholder.svg?height=400&width=400",
      category: "Party Wear",
      size: "Free Size",
      color: "Green",
      price: 180,
    },
    rentedDate: "2023-09-20T00:00:00Z",
    dueDate: "2023-09-30T00:00:00Z",
    returnedDate: null,
    rentalDuration: 10,
    status: "OVERDUE",
    depositAmount: 54,
    rentAmount: 126,
    depositPaid: true,
    rentPaid: false,
  },
]

// Async thunks
export const fetchRentals = createAsyncThunk("rentals/fetchRentals", async (_, { rejectWithValue }) => {
  try {
    // In a real application, this would be an API call
    // For this example, we'll use the mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockRentals)
      }, 1000)
    })
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchRentalById = createAsyncThunk("rentals/fetchRentalById", async (id, { rejectWithValue }) => {
  try {
    // In a real application, this would be an API call
    // For this example, we'll use the mock data
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const rental = mockRentals.find((rental) => rental.id === id)
        if (rental) {
          resolve(rental)
        } else {
          reject(new Error("Rental not found"))
        }
      }, 1000)
    })
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const payRent = createAsyncThunk("rentals/payRent", async (id, { rejectWithValue }) => {
  try {
    // In a real application, this would be an API call
    // For this example, we'll simulate a successful payment
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, rentPaid: true })
      }, 1000)
    })
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const rentalSlice = createSlice({
  name: "rentals",
  initialState: {
    rentals: [],
    currentRental: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchRentals
      .addCase(fetchRentals.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRentals.fulfilled, (state, action) => {
        state.loading = false
        state.rentals = action.payload
      })
      .addCase(fetchRentals.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch rentals"
      })

      // fetchRentalById
      .addCase(fetchRentalById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRentalById.fulfilled, (state, action) => {
        state.loading = false
        state.currentRental = action.payload
      })
      .addCase(fetchRentalById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch rental"
      })

      // payRent
      .addCase(payRent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(payRent.fulfilled, (state, action) => {
        state.loading = false

        // Update the current rental if it matches the ID
        if (state.currentRental && state.currentRental.id === action.payload.id) {
          state.currentRental.rentPaid = true
        }

        // Update the rental in the list
        state.rentals = state.rentals.map((rental) =>
          rental.id === action.payload.id ? { ...rental, rentPaid: true } : rental,
        )
      })
      .addCase(payRent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to process payment"
      })
  },
})

export default rentalSlice.reducer
