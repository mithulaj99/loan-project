from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.core.files.storage import FileSystemStorage
from django.conf import settings

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

import pandas as pd
import os
import joblib
import json

from .models import LoanHistory  # ✅ history model

BASE_DIR = settings.BASE_DIR

# ----------- LOAD MODELS -----------

def load_model(path):
    try:
        return joblib.load(path)
    except:
        return None

model_paid = load_model(os.path.join(BASE_DIR, 'predictor/models/model_paid.pkl'))
model_rate = load_model(os.path.join(BASE_DIR, 'predictor/models/model_rate.pkl'))
model_term = load_model(os.path.join(BASE_DIR, 'predictor/models/model_term.pkl'))

# ----------- EMI -----------

def calculate_emi(p, r, n):
    r = r / (12 * 100)
    emi = (p * r * (1 + r)**n) / ((1 + r)**n - 1)
    return round(emi, 2)

# ----------- BANKS -----------

def recommend_bank(purpose, prob, interest):

    banks = [
        {"bank": "HDFC Bank", "interest_rate": interest - 1.2, "link": "https://www.hdfcbank.com", "logo": "https://logo.clearbit.com/hdfcbank.com"},
        {"bank": "ICICI Bank", "interest_rate": interest - 0.8, "link": "https://www.icicibank.com", "logo": "https://logo.clearbit.com/icicibank.com"},
        {"bank": "State Bank of India", "interest_rate": interest - 1.5, "link": "https://sbi.co.in", "logo": "https://logo.clearbit.com/sbi.co.in"},
        {"bank": "Axis Bank", "interest_rate": interest - 0.5, "link": "https://www.axisbank.com", "logo": "https://logo.clearbit.com/axisbank.com"},
        {"bank": "Federal Bank", "interest_rate": interest, "link": "https://www.federalbank.co.in", "logo": "https://logo.clearbit.com/federalbank.co.in"},
        {"bank": "Punjab National Bank", "interest_rate": interest - 1.0, "link": "https://www.pnbindia.in", "logo": "https://logo.clearbit.com/pnbindia.in"},
        {"bank": "Bank of Baroda", "interest_rate": interest - 0.9, "link": "https://www.bankofbaroda.in", "logo": "https://logo.clearbit.com/bankofbaroda.in"},
        {"bank": "Kotak Bank", "interest_rate": interest - 0.6, "link": "https://www.kotak.com", "logo": "https://logo.clearbit.com/kotak.com"},
        {"bank": "Canara Bank", "interest_rate": interest - 1.3, "link": "https://www.canarabank.com", "logo": "https://logo.clearbit.com/canarabank.com"},
        {"bank": "Union Bank", "interest_rate": interest - 1.1, "link": "https://www.unionbankofindia.co.in", "logo": "https://logo.clearbit.com/unionbankofindia.co.in"},
    ]

    for b in banks:
        if prob > 80:
            b["interest_rate"] -= 0.5
        elif prob < 50:
            b["interest_rate"] += 0.8

        b["interest_rate"] = round(max(7.5, b["interest_rate"]), 2)

    banks = sorted(banks, key=lambda x: x["interest_rate"])
    return banks[0], banks

# ----------- LOGIN -----------

@csrf_exempt
def login_user(request):
    if request.method == "POST":
        data = json.loads(request.body)

        user = authenticate(
            username=data.get("username"),
            password=data.get("password")
        )

        if user:
            login(request, user)
            return JsonResponse({"message": "Login successful"})
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    return JsonResponse({"error": "Only POST allowed"}, status=405)

# ----------- REGISTER -----------

@csrf_exempt
def register_user(request):
    if request.method == "POST":
        data = json.loads(request.body)

        if User.objects.filter(username=data.get("username")).exists():
            return JsonResponse({"error": "User exists"}, status=400)

        User.objects.create_user(
            username=data.get("username"),
            password=data.get("password")
        )

        return JsonResponse({"message": "Registered"})

    return JsonResponse({"error": "Only POST allowed"}, status=405)

# ----------- PREDICT -----------

@csrf_exempt
def predict(request):

    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = request.POST

        # FILES
        fs = FileSystemStorage(location=os.path.join(BASE_DIR, "uploads"))

        for f in ['identity_file', 'income_file', 'address_file']:
            file = request.FILES.get(f)
            if file:
                fs.save(file.name, file)

        # INPUTS
        age = float(data.get('age', 30))
        income = float(data.get('annual_income', 50000))
        credit = float(data.get('credit_score', 700))
        loan_amount = float(data.get('loan_amount', 10000))
        loan_term = int(data.get('loan_term') or 24)

        df = pd.DataFrame([{
            'age': age,
            'annual_income': income,
            'employment_status': data.get('employment_status'),
            'credit_score': credit,
            'loan_amount': loan_amount,
            'loan_purpose': data.get('loan_purpose'),
        }])

        # MODEL
        prob = model_paid.predict_proba(df)[0][1] * 100 if model_paid else 70
        interest = float(model_rate.predict(df)[0]) if model_rate else 12

        if model_term:
            loan_term = int(model_term.predict(df)[0])

        prob = max(5, min(prob, 99))

        emi = calculate_emi(loan_amount, interest, loan_term)

        best_bank, bank_list = recommend_bank(data.get('loan_purpose'), prob, interest)

        # SAVE HISTORY
        if request.user.is_authenticated:
            LoanHistory.objects.create(
                user=request.user,
                loan_amount=loan_amount,
                interest_rate=interest,
                emi=emi
            )

        return JsonResponse({
            "probability_of_paying_back": round(prob, 2),
            "predicted_interest_rate_percent": round(interest, 2),
            "predicted_loan_term_months": loan_term,
            "predicted_monthly_installment": emi,
            "best_bank": best_bank,
            "bank_recommendation": bank_list
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# ----------- PDF REPORT -----------

@csrf_exempt
def download_report(request):

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="loan_report.pdf"'

    doc = SimpleDocTemplate(response)
    styles = getSampleStyleSheet()

    content = []

    content.append(Paragraph("Loan Prediction Report", styles["Title"]))
    content.append(Spacer(1, 10))

    content.append(Paragraph("Generated from Loan Predictor System", styles["Normal"]))
    content.append(Spacer(1, 10))

    content.append(Paragraph("Includes EMI, Interest Rate, and Bank Suggestions", styles["Normal"]))

    doc.build(content)

    return response

# ----------- HISTORY API -----------

def get_history(request):
    data = list(LoanHistory.objects.values())
    return JsonResponse(data, safe=False)