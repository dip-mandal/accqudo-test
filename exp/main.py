import os
import hmac
import hashlib

import razorpay
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise RuntimeError("Razorpay credentials are missing")

client = razorpay.Client(
    auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
)

app = FastAPI(title="Razorpay Test API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OrderRequest(BaseModel):
    amount: int  # amount in paise
    currency: str = "INR"
    receipt: str = "receipt_001"


class VerifyRequest(BaseModel):
    razorpay_payment_id: str | None = None
    razorpay_order_id: str | None = None
    razorpay_signature: str | None = None


@app.get("/")
def home():
    return {"message": "Razorpay backend is running"}


@app.get("/payment-config")
def payment_config():
    # Only the public Key ID is returned.
    # NEVER return RAZORPAY_KEY_SECRET.
    return {
        "key_id": RAZORPAY_KEY_ID
    }


@app.post("/create-order")
def create_order(data: OrderRequest):

    if data.amount < 100:
        raise HTTPException(
            status_code=400,
            detail="Minimum amount is ₹1"
        )

    try:
        order = client.order.create({
            "amount": data.amount,
            "currency": data.currency.upper(),
            "receipt": data.receipt,
        })

        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key_id": RAZORPAY_KEY_ID,
        }

    except Exception as e:
        print("Razorpay order error:", e)
        raise HTTPException(
            status_code=500,
            detail="Unable to create Razorpay order"
        )


@app.post("/verify-payment")
def verify_payment(data: VerifyRequest):

    if not data.razorpay_payment_id:
        raise HTTPException(
            status_code=400,
            detail="Missing razorpay_payment_id"
        )

    if not data.razorpay_order_id:
        raise HTTPException(
            status_code=400,
            detail="Missing razorpay_order_id"
        )

    if not data.razorpay_signature:
        raise HTTPException(
            status_code=400,
            detail="Missing razorpay_signature"
        )

    message = (
        f"{data.razorpay_order_id}|"
        f"{data.razorpay_payment_id}"
    )

    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(
        expected_signature,
        data.razorpay_signature
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid payment signature"
        )

    return {
        "success": True,
        "message": "Payment verified successfully",
        "payment_id": data.razorpay_payment_id,
        "order_id": data.razorpay_order_id,
    }