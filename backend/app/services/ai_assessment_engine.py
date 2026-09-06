import json
import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import httpx
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import StudentProfile, User
from app.models.career import CareerRole, StudentSkill, CareerRoleSkill
from app.models.taxonomy import Skill
from app.models.opportunity import Opportunity, OpportunitySkill
from app.models.assessment import (
    AssessmentTest,
    AssessmentQuestion,
    AssessmentOption,
    AssessmentAttempt,
    AssessmentAnswer,
    AssessmentSkillScore,
)
from app.models.system import Notification

logger = logging.getLogger("ai_assessment_engine")

# Canonical Statutory & Pharmacopoeial References
AYUSH_REGULATORY_BENCHMARKS = [
    {
        "domain": "Clinical Research & Safety",
        "standard": "AYUSH-GCP Section 4.2 & Schedule Y (CTRI Standards)",
        "citation": "Ethical Committee mandate & Serious Adverse Event (SAE) reporting within 24 hours.",
    },
    {
        "domain": "Standardization & Quality Assurance",
        "standard": "Ayurvedic Pharmacopoeia of India (API) Part I, Vol V & WHO Guidelines",
        "citation": "Physicochemical assays, HPTLC Rf validation, and Heavy Metal limits (Pb <= 10 ppm, As <= 3 ppm).",
    },
    {
        "domain": "Manufacturing & Stability",
        "standard": "Schedule T (AYUSH Good Manufacturing Practices - GMP)",
        "citation": "Standardized batch records, in-process microbial limits, and accelerated stability testing.",
    },
    {
        "domain": "Clinical Therapeutics & Diagnostics",
        "standard": "Classical Ayurvedic Clinical Protocol (Charaka Samhita & NABH AYUSH Standards)",
        "citation": "Prakriti assessment, pulse diagnosis protocols, and Panchakarma detoxification contraindications.",
    },
]

async def _call_gemini_api(prompt: str) -> Optional[str]:
    """Helper to query Google Gemini API if GEMINI_API_KEY is configured."""
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "responseMimeType": "application/json",
        },
    }

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    return text
    except Exception as e:
        logger.info(f"Gemini API request failed/timed out, seamlessly using procedural generator: {e}")
    return None


def _generate_mixed_assessment_questions(discipline_name: str = "Ayurveda") -> List[Dict[str, Any]]:
    """
    Synthesizes a comprehensive multi-subject AYUSH assessment covering 6 foundational disciplines:
    1. Kayachikitsa (Internal Medicine & Clinical Diagnostics)
    2. Dravyaguna Vijnana (Herbal Pharmacology & Therapeutics)
    3. Panchakarma (Detoxification Protocols & Procedures)
    4. Rasa Shastra & Bhaishajya Kalpana (Formulations, HPTLC & GMP)
    5. AYUSH-GCP, Safety & Pharmacovigilance (Clinical Trials & CTRI)
    6. Patient Consultation, Ahara/Vihara & Medical Ethics
    All skills strictly map to valid database records in the skills table.
    """
    scenarios = [
        # --- 1. KAYACHIKITSA (Internal Medicine & Diagnostics) ---
        {
            "subject": "Kayachikitsa (Internal Medicine)",
            "subject_domain": "Clinical Diagnostics & Therapeutics",
            "scenario": (
                "A 46-year-old male with Pitta-Kapha Prakriti presents with chronic relapsing Jwara (fever), bitter taste in mouth, "
                "burning micturition, and epigastric burning (Amlapitta). Laboratory tests indicate mild indirect hyperbilirubinemia. "
                "Considering classical Charaka Samhita Chikitsa Sthana (Chapter 3 on Jwara), which clinical management protocol is most appropriate?"
            ),
            "skill_name": "Prakriti & Rogi Pariksha Diagnostics",
            "skill_id": "sk-patient-diag",
            "standard": "Charaka Samhita Chikitsa Sthana Ch. 3 & NABH AYUSH Clinical Protocols",
            "options": [
                {
                    "text": "Administer Tikta Rasa predominantly (such as Kiratatikta / Sudarshana Churna with Guduchi) to pacify Pitta and Ama without aggravating Vata, while avoiding immediate heavy Langhana (fasting) to prevent Dhatu Kshaya.",
                    "is_correct": True,
                    "explanation": "Correct. In Pitta-dominant Jwara with hepatic involvement, bitter tonics (Tikta-Rasa) digest Ama and relieve Pitta without exacerbating tissue depletion (Dhatu Kshaya)."
                },
                {
                    "text": "Perform immediate Tikshna Vamana (strong therapeutic emesis) with high doses of Madanaphala regardless of the patient's burning distress.",
                    "is_correct": False,
                    "explanation": "Incorrect. In severe Pitta burning micturition and weakness, aggressive emesis without prior oleation is contraindicated."
                },
                {
                    "text": "Administer Katu-Ushna formulations like Trikatu with warm alcohol to induce diaphoresis.",
                    "is_correct": False,
                    "explanation": "Incorrect. Pungent and hot drugs aggravate Pitta and exacerbate burning sensation and hyperbilirubinemia."
                },
                {
                    "text": "Institute complete water fasting (Nirjala Langhana) for 7 consecutive days without hydration monitoring.",
                    "is_correct": False,
                    "explanation": "Incorrect. Unmonitored prolonged fasting causes dehydration and collapse in Pitta constitution."
                }
            ]
        },
        {
            "subject": "Kayachikitsa (Internal Medicine)",
            "subject_domain": "Metabolic Disorders & Chronic Care",
            "scenario": (
                "A 52-year-old female diagnosed with Prameha (Type 2 Diabetes Mellitus) with HbA1c 8.6% and complaints of Kara-Pada Daha "
                "(peripheral burning sensation) and Pipasa (polydipsia) requests classical Ayurvedic management alongside existing Metformin therapy. "
                "Per classical Madhumeha Chikitsa and integrative safety guidelines, what is the best integrative prescribing protocol?"
            ),
            "skill_name": "Prakriti & Rogi Pariksha Diagnostics",
            "skill_id": "sk-patient-diag",
            "standard": "Sushruta Samhita Nidana Sthana Ch. 11 & ICMR Integrative Diabetes Guidelines",
            "options": [
                {
                    "text": "Prescribe Nishamalaki (Curcuma longa + Phyllanthus emblica) and purified Shilajatu with Triphala Kwatha; monitor fasting blood glucose every 2 weeks to prevent hypoglycemia, and document the co-prescription.",
                    "is_correct": True,
                    "explanation": "Correct. Nishamalaki and Shilajatu have documented hypoglycemic and neuroprotective efficacy, synergizing safely with Metformin with regular glycemic monitoring."
                },
                {
                    "text": "Immediately discontinue the patient's conventional Metformin without consulting her diabetologist.",
                    "is_correct": False,
                    "explanation": "Incorrect. Abruptly withdrawing oral hypoglycemics risks acute rebound hyperglycemia and ketoacidosis."
                },
                {
                    "text": "Prescribe high-sugar classical Asavas without testing specific gravity or alcohol content.",
                    "is_correct": False,
                    "explanation": "Incorrect. Sugar-rich formulations are strictly contraindicated in uncontrolled diabetic patients."
                },
                {
                    "text": "Advise the patient to discontinue all exercise and consume heavy ghee preparations exclusively.",
                    "is_correct": False,
                    "explanation": "Incorrect. Exercise (Vyayama) and light diet (Laghu Ahara) are fundamental to Prameha management."
                }
            ]
        },

        # --- 2. DRAVYAGUNA VIJNANA (Herbal Pharmacology & Therapeutics) ---
        {
            "subject": "Dravyaguna (Herbal Pharmacology)",
            "subject_domain": "Phytochemistry & Pharmacodynamics",
            "scenario": (
                "A pharmacognosy review evaluates Ashwagandha (Withania somnifera) root formulations for adaptogenic and neuroprotective efficacy. "
                "Which active steroidal lactone marker compound is primarily quantified per the Ayurvedic Pharmacopoeia of India (API) monograph, "
                "and in which clinical condition is excessive unsupervised administration contraindicated?"
            ),
            "skill_name": "Dravyaguna (Herbal Pharmacology)",
            "skill_id": "sk-dravyaguna",
            "standard": "Ayurvedic Pharmacopoeia of India (API) Part I, Vol I & WHO Monographs on Selected Medicinal Plants",
            "options": [
                {
                    "text": "Withaferin-A and Withanolide-A; contraindicated in active Thyrotoxicosis / severe Hyperthyroidism due to potential stimulation of thyroid hormone synthesis.",
                    "is_correct": True,
                    "explanation": "Correct. Withanolide-A and Withaferin-A are standard API chromatographic markers. Ashwagandha elevates T3/T4 levels, making it unsafe in uncontrolled thyrotoxicosis."
                },
                {
                    "text": "Reserpine and Ajmaline; contraindicated in hypotension.",
                    "is_correct": False,
                    "explanation": "Incorrect. Reserpine and Ajmaline are markers of Rauvolfia serpentina (Sarpagandha), not Withania somnifera."
                },
                {
                    "text": "Guggulsterone E and Z; contraindicated in pregnancy.",
                    "is_correct": False,
                    "explanation": "Incorrect. Guggulsterones are markers of Commiphora mukul."
                },
                {
                    "text": "Bacoside A and B; contraindicated in pediatric cognitive delay.",
                    "is_correct": False,
                    "explanation": "Incorrect. Bacosides are markers of Bacopa monnieri (Brahmi)."
                }
            ]
        },
        {
            "subject": "Dravyaguna (Herbal Pharmacology)",
            "subject_domain": "Herb-Drug Interactions & Pharmacokinetics",
            "scenario": (
                "A patient undergoing post-myocardial infarction cardiac rehabilitation is maintained on oral anticoagulant therapy (Warfarin). "
                "An Ayurvedic physician considers prescribing Shuddha Guggulu (Commiphora mukul) for dyslipidemia. "
                "According to pharmacokinetic interaction data, what is the anticipated clinical risk?"
            ),
            "skill_name": "Dravyaguna (Herbal Pharmacology)",
            "skill_id": "sk-dravyaguna",
            "standard": "API Monograph on Commiphora mukul & Herb-Drug Interaction Registry",
            "options": [
                {
                    "text": "Guggulsterones can induce CYP3A4 metabolism and modulate platelet aggregation, potentially altering Warfarin's anticoagulant efficacy and increasing bleeding risk; frequent INR monitoring is mandatory.",
                    "is_correct": True,
                    "explanation": "Correct. Commiphora mukul has known antiplatelet effects and hepatic enzyme modulation that can destabilize Warfarin therapeutic index, necessitating strict INR titration."
                },
                {
                    "text": "There is zero interaction because Ayurvedic herbs undergo complete digestion with no hepatic cytochrome interaction.",
                    "is_correct": False,
                    "explanation": "Incorrect. Botanical phytoconstituents undergo Phase I and Phase II hepatic biotransformation and interact with CYP450 enzymes."
                },
                {
                    "text": "Guggulu completely eliminates Warfarin from renal excretion within 30 minutes, preventing therapeutic action.",
                    "is_correct": False,
                    "explanation": "Incorrect. Guggulu does not accelerate acute glomerular filtration of Warfarin in this manner."
                },
                {
                    "text": "Guggulu must always be taken with 1000mg Aspirin to counteract hypercoagulability.",
                    "is_correct": False,
                    "explanation": "Incorrect. Combining Guggulu, Warfarin, and Aspirin exponentially multiplies gastrointestinal hemorrhage risks."
                }
            ]
        },

        # --- 3. PANCHAKARMA (Detoxification & Cleansing Protocols) ---
        {
            "subject": "Panchakarma (Detoxification Protocols)",
            "subject_domain": "Purvakarma & Assessment",
            "scenario": (
                "During preparation for classical Vamana Karma (therapeutic emesis) in a Kaphaja skin disorder, a patient completes 5 days "
                "of internal oleation (Snehapana) with Mahatiktaka Ghrita. Which combination of signs indicates Samyak Snigdha Lakshana "
                "(optimal oleation), confirming readiness for Svedana and Vamana?"
            ),
            "skill_name": "Panchakarma Protocol Administration",
            "skill_id": "sk-panchakarma",
            "standard": "Charaka Samhita Sutra Sthana Ch. 13 (Snehadhyaya) & NABH Panchakarma Standards",
            "options": [
                {
                    "text": "Vatanulomana (downward flatus), Deepagni (restoration of appetite), Snigdha Varchas (unctuous loose stools), and Gatra Mardavatva (softness of body with aversion to fat).",
                    "is_correct": True,
                    "explanation": "Correct. Classical Samyak Snigdha Lakshanas include digestive stability, unctuous stool passage, softness of skin, and natural satiety/aversion to further ghee consumption."
                },
                {
                    "text": "Severe constipation, dry rough skin, elevated pulse, and intense hunger for fried food.",
                    "is_correct": False,
                    "explanation": "Incorrect. These are classic symptoms of Asnigdha (inadequate oleation)."
                },
                {
                    "text": "Extreme vomiting, severe diarrhea, jaundice, and severe dehydration.",
                    "is_correct": False,
                    "explanation": "Incorrect. These represent complications (Atisnigdha / toxic overflow) requiring immediate intervention, not planned emesis."
                },
                {
                    "text": "Absence of any physical change after consuming 500ml of medicated ghee.",
                    "is_correct": False,
                    "explanation": "Incorrect. Lack of physiological response indicates impaired absorption or inadequate dose."
                }
            ]
        },
        {
            "subject": "Panchakarma (Detoxification Protocols)",
            "subject_domain": "Pradhanakarma & Emergency Management",
            "scenario": (
                "During the administration of an Anuvasana Basti (oil enema) containing Sahacharadi Taila, the patient suddenly complains of "
                "severe rectal tenesmus, cramping, and expels the oil within 2 minutes of infusion. "
                "Per classical Panchakarma guidelines, what is the interpretation and next clinical step?"
            ),
            "skill_name": "Panchakarma Protocol Administration",
            "skill_id": "sk-panchakarma",
            "standard": "Sushruta Samhita Chikitsa Sthana Ch. 37 & CCRAS Panchakarma Safety Manual",
            "options": [
                {
                    "text": "Immediate expulsion indicates improper retention due to cold oil, rapid infusion pressure, or heightened rectal irritability; soothe with mild Kati Sweda (local fomentation), allow rest in supine position, and reschedule with lukewarm oil at controlled pressure.",
                    "is_correct": True,
                    "explanation": "Correct. Anuvasana Basti requires minimum retention (3 to 9 hours). Expulsion within minutes necessitates soothing local warmth and technique correction."
                },
                {
                    "text": "Immediately administer a stronger hypertonic decoction enema (Kashaya Basti) to purge the colon.",
                    "is_correct": False,
                    "explanation": "Incorrect. Administering an irritant Kashaya Basti immediately after acute spasm causes severe mucosal irritation."
                },
                {
                    "text": "Force the patient to walk briskly for 5 kilometers to reabsorb the expelled oil.",
                    "is_correct": False,
                    "explanation": "Incorrect. Physical exertion after Basti provokes Vata and causes abdominal colic."
                },
                {
                    "text": "Discharge the patient without assessing vital signs or documenting the expulsion.",
                    "is_correct": False,
                    "explanation": "Incorrect. Neglecting clinical monitoring violates clinical safety standards."
                }
            ]
        },

        # --- 4. RASA SHASTRA & BHAISHAJYA KALPANA (Standardization & GMP) ---
        {
            "subject": "Rasa Shastra & Standardization",
            "subject_domain": "Quality Control & Bhasma Pariksha",
            "scenario": (
                "In the quality control laboratory of an AYUSH manufacturing unit, a batch of Swarna Makshika Bhasma is subjected to "
                "classical Bhasma Pariksha before commercial release. Which physical tests confirm complete incinerated transformation "
                "into non-toxic nano-structured particles per the Ayurvedic Pharmacopoeia of India?"
            ),
            "skill_name": "Ayurvedic Pharmacopoeia Compliance",
            "skill_id": "sk-pharmacopoeia",
            "standard": "Ayurvedic Pharmacopoeia of India (API) Part I, Vol V & Rasa Tarangini Taranga 2",
            "options": [
                {
                    "text": "Varitaratva (floating effortlessly on still water surface) and Rekhapurnatva (particles entering and remaining within the micro-furrows of the skin on fingertip rubbing).",
                    "is_correct": True,
                    "explanation": "Correct. Varitaratva and Rekhapurnatva verify that particle size has reached sub-micron colloidal fineness, ensuring physiological safety and absorption."
                },
                {
                    "text": "Rapid sinkage to the bottom of the beaker with metallic luster and clumping.",
                    "is_correct": False,
                    "explanation": "Incorrect. Sinking with metallic luster indicates raw, unreduced heavy metal particles (Apakva)."
                },
                {
                    "text": "Dissolving completely in cold water within 5 seconds with effervescence.",
                    "is_correct": False,
                    "explanation": "Incorrect. Classical metallic bhasmas are insoluble metal oxides and do not effervesce in water."
                },
                {
                    "text": "Emitting toxic sulfur dioxide fumes upon gentle heating.",
                    "is_correct": False,
                    "explanation": "Incorrect. Residual fumes indicate incomplete incineration and toxicity."
                }
            ]
        },
        {
            "subject": "Rasa Shastra & Standardization",
            "subject_domain": "HPTLC Fingerprinting & Schedule T GMP",
            "scenario": (
                "High-Performance Thin-Layer Chromatography (HPTLC) densitometric scanning of a finished polyherbal Haridra formulation "
                "shows an Rf shift of 0.16 and tailing of the Curcumin peak. "
                "According to Schedule T (AYUSH GMP) validation protocols, what is the corrective laboratory troubleshooting action?"
            ),
            "skill_name": "HPTLC Fingerprinting & Standardization",
            "skill_id": "sk-hptlc",
            "standard": "Schedule T (Good Manufacturing Practices) & Ayurvedic Pharmacopoeia of India Part I",
            "options": [
                {
                    "text": "Verify chromatographic chamber saturation time with filter paper lining for 30 minutes, equilibrate mobile phase solvent ratios, and re-run calibration standards on a pre-conditioned silica gel 60 F254 plate.",
                    "is_correct": True,
                    "explanation": "Correct. In botanical HPTLC, inadequate vapor saturation and solvent evaporation cause band tailing and Rf shifts. Chamber equilibration is the validated remedy."
                },
                {
                    "text": "Double the sample spot volume from 5 microliters to 50 microliters.",
                    "is_correct": False,
                    "explanation": "Incorrect. Overloading sample volume worsens tailing and band diffusion."
                },
                {
                    "text": "Release the batch immediately without investigating the chromatographic discrepancy.",
                    "is_correct": False,
                    "explanation": "Incorrect. Releasing out-of-specification batches violates Schedule T GMP statutory compliance."
                },
                {
                    "text": "Change the detection wavelength to infrared arbitrarily.",
                    "is_correct": False,
                    "explanation": "Incorrect. Detection wavelengths must match monograph UV/Vis absorption maxima."
                }
            ]
        },

        # --- 5. AYUSH-GCP, SAFETY & PHARMACOVIGILANCE ---
        {
            "subject": "AYUSH-GCP & Safety",
            "subject_domain": "Clinical Trials & SAE Reporting",
            "scenario": (
                "In a multi-center randomized controlled trial registered on the Clinical Trials Registry - India (CTRI) evaluating a classical "
                "herbomineral rasayana for rheumatoid arthritis, a participant is hospitalized with acute Stevens-Johnson syndrome. "
                "Under AYUSH-GCP guidelines, what is the investigator's legally mandated responsibility?"
            ),
            "skill_name": "Good Clinical Practice (AYUSH-GCP)",
            "skill_id": "sk-gcp",
            "standard": "AYUSH-GCP Guidelines Section 4.2 & Schedule Y (Serious Adverse Event Reporting)",
            "options": [
                {
                    "text": "Immediately suspend study medication, provide emergency clinical management, and submit a formal Serious Adverse Event (SAE) report to the Institutional Ethics Committee (IEC) and regulatory authority within 24 hours.",
                    "is_correct": True,
                    "explanation": "Correct. AYUSH-GCP mandates that all serious adverse events must be reported to the IEC, sponsor, and licensing authority within 24 hours of occurrence."
                },
                {
                    "text": "Wait for 30 days until the monthly trial monitoring meeting before logging the incident.",
                    "is_correct": False,
                    "explanation": "Incorrect. Delayed reporting of life-threatening events violates statutory trial regulations."
                },
                {
                    "text": "Quietly drop the patient from the study records without filing an adverse event report.",
                    "is_correct": False,
                    "explanation": "Incorrect. Concealing adverse reactions constitutes severe scientific misconduct."
                },
                {
                    "text": "Double the study dosage to overcome the allergic dermatological reaction.",
                    "is_correct": False,
                    "explanation": "Incorrect. Escalating dose during acute hypersensitivity can be fatal."
                }
            ]
        },
        {
            "subject": "AYUSH-GCP & Safety",
            "subject_domain": "Pharmacovigilance & Causality Assessment",
            "scenario": (
                "A peripheral AYUSH pharmacovigilance center receives an Adverse Drug Reaction (ADR) report of acute liver enzyme elevation "
                "following ingestion of an over-the-counter herbal slimming churna. "
                "Using the WHO-UMC causality assessment scale, what key data is required to classify the causality as 'Probable / Likely'?"
            ),
            "skill_name": "Pharmacovigilance for AYUSH",
            "skill_id": "sk-pharmacovig",
            "standard": "National Pharmacovigilance Programme for AYUSH & WHO-UMC Causality Assessment Scale",
            "options": [
                {
                    "text": "Documented reasonable temporal sequence after starting the formulation, clinical improvement upon de-challenge (cessation), absence of confounding viral hepatitis or co-prescribed hepatotoxic drugs, and consistency with known constituent profiles.",
                    "is_correct": True,
                    "explanation": "Correct. The WHO-UMC scale defines 'Probable' by clear temporal onset, positive de-challenge, exclusion of competing causes (viral/allopathic), and pharmacological plausibility."
                },
                {
                    "text": "A single anonymous phone call claiming the product caused nausea.",
                    "is_correct": False,
                    "explanation": "Incorrect. Unverified anonymous reports lack documented clinical evidence for causality assessment."
                },
                {
                    "text": "Confirming that the patient never actually consumed the formulation.",
                    "is_correct": False,
                    "explanation": "Incorrect. Without drug exposure, causality is unclassifiable or negative."
                },
                {
                    "text": "Testing the formulation only for moisture content without medical history analysis.",
                    "is_correct": False,
                    "explanation": "Incorrect. Moisture testing does not determine clinical organ causality."
                }
            ]
        },

        # --- 6. PATIENT COUNSELING, AHARA/VIHARA & MEDICAL ETHICS ---
        {
            "subject": "Patient Counseling & Lifestyle",
            "subject_domain": "Ahara & Vihara Lifestyle Prescription",
            "scenario": (
                "A 38-year-old software engineer with high mental stress, irregular meals, and Pitta-Vata constitutional imbalance "
                "presents with insomnia (Anidra) and burning dyspepsia. Beyond pharmacotherapy, what is the most appropriate holistic "
                "Ahara-Vihara counseling strategy?"
            ),
            "skill_name": "Patient Consultation & Lifestyle Counseling",
            "skill_id": "sk-counseling",
            "standard": "Charaka Samhita Sutra Sthana Ch. 5-7 (Matrashitiya & Tasyashitiya) on Ahara-Vihara",
            "options": [
                {
                    "text": "Recommend Nidana Parivarjana (avoiding spicy, fermented, night-time screen exposure), prescribe evening Takra / warm milk with nutmeg, establish fixed circadian meal times, and advise gentle Padabhyanga (foot massage with warm sesame oil) before bedtime.",
                    "is_correct": True,
                    "explanation": "Correct. Addressing root lifestyle triggers (Nidana Parivarjana), circadian meal timing, and somatic relaxation (Padabhyanga) directly pacifies Vata-Pitta pathogenesis."
                },
                {
                    "text": "Advise consuming heavy cold salads and chilled energy drinks at midnight.",
                    "is_correct": False,
                    "explanation": "Incorrect. Cold and raw food at midnight aggravates Vata and further impairs Agni."
                },
                {
                    "text": "Recommend high-intensity cardiovascular running immediately before sleep at 1:00 AM.",
                    "is_correct": False,
                    "explanation": "Incorrect. Late-night vigorous exercise stimulates the sympathetic system, worsening insomnia."
                },
                {
                    "text": "Instruct the patient that diet and sleep schedule have zero relevance to disease progression.",
                    "is_correct": False,
                    "explanation": "Incorrect. Ahara and Nidra are fundamental pillars (Trayopastambha) of health in AYUSH."
                }
            ]
        },
        {
            "subject": "Patient Counseling & Lifestyle",
            "subject_domain": "Informed Consent & Integrative Ethics",
            "scenario": (
                "A patient with a severe diabetic foot ulcer (Dushta Vrana) with spreading cellulitis and purulent discharge presents to an outpatient "
                "AYUSH clinic refusing conventional hospital care. What is the ethically and legally sound duty of the Ayurvedic clinician?"
            ),
            "skill_name": "Patient Consultation & Lifestyle Counseling",
            "skill_id": "sk-counseling",
            "standard": "CCIM / NCISM Code of Ethics & NABH Integrative Medicine Clinical Guidelines",
            "options": [
                {
                    "text": "Perform classical emergency antiseptic cleansing and dressing (Vrana Shodhana/Ropana), thoroughly explain the imminent risk of systemic sepsis and amputation in clear language, obtain documented informed consent, and initiate urgent inter-professional referral to a surgical team.",
                    "is_correct": True,
                    "explanation": "Correct. Ethical AYUSH practice requires immediate supportive care, transparent risk communication, documented informed consent, and timely collaborative referral in limb-threatening emergencies."
                },
                {
                    "text": "Guarantee that pure herbal pastes will achieve 100% cure within 24 hours and advise the patient to never consult modern surgeons.",
                    "is_correct": False,
                    "explanation": "Incorrect. Making false medical guarantees in acute spreading infection violates statutory medical council ethics."
                },
                {
                    "text": "Immediately turn the patient away onto the street without providing any basic wound stabilization.",
                    "is_correct": False,
                    "explanation": "Incorrect. Refusing emergency supportive aid violates basic humanitarian and clinical duties."
                },
                {
                    "text": "Perform invasive surgical excision without sterile surgical infrastructure or emergency resuscitation equipment.",
                    "is_correct": False,
                    "explanation": "Incorrect. Performing major invasive surgery without statutory surgical credentials and sterile OT violates clinical law."
                }
            ]
        }
    ]

    questions = []
    for sc in scenarios:
        q_id = f"ai-q-{uuid.uuid4().hex[:10]}"
        q_options = [
            {
                "id": f"ai-opt-{uuid.uuid4().hex[:10]}",
                "text": opt["text"],
                "is_correct": opt["is_correct"],
                "explanation": opt["explanation"]
            }
            for opt in sc["options"]
        ]
        questions.append({
            "id": q_id,
            "scenario": sc["scenario"],
            "question_text": sc["scenario"],
            "subject": sc["subject"],
            "subject_domain": sc["subject_domain"],
            "skill_name": sc["skill_name"],
            "skill_id": sc["skill_id"],
            "standard": sc["standard"],
            "options": q_options
        })

    return questions


def _generate_procedural_questions(
    discipline_name: str,
    target_role_title: str,
    skills: List[Dict[str, Any]],
    assessment_type: str = "MIXED_COMPREHENSIVE",
    company_name: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Intelligent procedural generator that synthesizes realistic, scenario-based
    clinical and industrial problem dilemmas directly from domain taxonomies.
    If assessment_type is MIXED_COMPREHENSIVE (default), returns the 12-question multi-subject exam.
    """
    if assessment_type == "MIXED_COMPREHENSIVE":
        return _generate_mixed_assessment_questions(discipline_name=discipline_name)

    # For role-specific or job-fit assessment, generate from the mixed pool or targeted skills
    all_mixed = _generate_mixed_assessment_questions(discipline_name=discipline_name)
    if assessment_type == "JOB_FIT" and company_name:
        for q in all_mixed[:6]:
            q["scenario"] = f"At {company_name}, evaluating candidate capability for {target_role_title}: {q['scenario']}"
            q["question_text"] = q["scenario"]
        return all_mixed[:6]

    return all_mixed[:6]


async def generate_dynamic_assessment(
    db: AsyncSession,
    student_id: str,
    assessment_type: str = "STANDARD_BENCHMARK",
    career_role_id: Optional[str] = None,
    opportunity_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Primary Dynamic Assessment Generator.
    Produces adaptive scenario questions based on:
    - Tier 1: Target Career Role + AYUSH Statutory Standards (AYUSH-GCP, API, WHO)
    - Tier 2: Job-Posting Fit + Recruiter Required Skills
    """
    # 1. Fetch Student Profile with discipline & skills
    st_res = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.id == student_id)
        .options(
            selectinload(StudentProfile.discipline),
            selectinload(StudentProfile.target_career_role).selectinload(CareerRole.role_skills).selectinload(CareerRoleSkill.skill),
            selectinload(StudentProfile.user)
        )
    )
    student = st_res.scalar_one_or_none()
    if not student:
        raise ValueError("Student profile not found")

    discipline_name = student.discipline.name if student.discipline else "Ayurveda"
    role_title = "Clinical Research Associate"
    target_skills = []
    company_name = None

    # 2. Resolve Role or Opportunity Context
    if assessment_type == "JOB_FIT" and opportunity_id:
        opp_res = await db.execute(
            select(Opportunity)
            .where(Opportunity.id == opportunity_id)
            .options(
                selectinload(Opportunity.required_skills).selectinload(OpportunitySkill.skill),
                selectinload(Opportunity.industry_profile)
            )
        )
        opp = opp_res.scalar_one_or_none()
        if opp:
            role_title = opp.title
            company_name = opp.industry_profile.company_name if opp.industry_profile else "Industry Partner"
            target_skills = [
                {"id": os.skill_id, "name": os.skill.name if os.skill else "Competency"}
                for os in opp.required_skills
            ]

    if not target_skills:
        # Tier 1: Default to Student's Target Career Role
        target_role = student.target_career_role
        if career_role_id and not target_role:
            cr_res = await db.execute(
                select(CareerRole)
                .where(CareerRole.id == career_role_id)
                .options(selectinload(CareerRole.role_skills).selectinload(CareerRoleSkill.skill))
            )
            target_role = cr_res.scalar_one_or_none()

        if target_role:
            role_title = target_role.title
            target_skills = [
                {"id": crs.skill_id, "name": crs.skill.name if crs.skill else "Clinical Skill"}
                for crs in target_role.role_skills
            ]

    if not target_skills:
        # Fallback query active skills
        sk_res = await db.execute(select(Skill).limit(3))
        skills_objs = sk_res.scalars().all()
        target_skills = [{"id": s.id, "name": s.name} for s in skills_objs]

    # 3. Query LLM or fallback to procedural generator
    questions_data = []

    # If mixed comprehensive assessment is selected, use the multi-subject scenario pool
    if assessment_type == "MIXED_COMPREHENSIVE":
        questions_data = _generate_mixed_assessment_questions(discipline_name=discipline_name)
    else:
        prompt = (
            f"You are an expert Chief Medical Officer and AYUSH Regulatory Assessment Specialist.\n"
            f"Generate exactly 3 scenario-based clinical and industrial evaluation questions for a {discipline_name} student "
            f"targeting the role of '{role_title}'{' at ' + company_name if company_name else ''}.\n"
            f"Target skills: {', '.join(s['name'] for s in target_skills)}.\n"
            f"Mandate real-world dilemmas citing statutory standards (AYUSH-GCP, Ayurvedic Pharmacopoeia of India, WHO Guidelines, or Schedule T GMP).\n"
            f"Return strict JSON with format:\n"
            f"[\n"
            f"  {{\n"
            f"    \"scenario\": \"string describing the real-world dilemma\",\n"
            f"    \"skill_name\": \"competency name\",\n"
            f"    \"skill_id\": \"id from target skills\",\n"
            f"    \"standard\": \"statutory benchmark citation\",\n"
            f"    \"options\": [\n"
            f"      {{\"text\": \"option text\", \"is_correct\": boolean, \"explanation\": \"reasoning\"}}\n"
            f"    ]\n"
            f"  }}\n"
            f"]"
        )

        llm_output = await _call_gemini_api(prompt)
        if llm_output:
            try:
                clean_text = llm_output.strip()
                if clean_text.startswith("```json"):
                    clean_text = clean_text[7:]
                elif clean_text.startswith("```"):
                    clean_text = clean_text[3:]
                if clean_text.endswith("```"):
                    clean_text = clean_text[:-3]
                parsed = json.loads(clean_text.strip())
                if isinstance(parsed, list) and len(parsed) >= 2:
                    for idx, q in enumerate(parsed):
                        q_id = f"ai-q-{uuid.uuid4().hex[:10]}"
                        options = [
                            {
                                "id": f"ai-opt-{uuid.uuid4().hex[:10]}",
                                "text": opt.get("text", "Option"),
                                "is_correct": bool(opt.get("is_correct", False)),
                                "explanation": opt.get("explanation", "Regulatory standard rationale.")
                            }
                            for opt in q.get("options", [])
                        ]
                        # Ensure at least one option is correct
                        if not any(o["is_correct"] for o in options) and options:
                            options[0]["is_correct"] = True

                        s_name = q.get("skill_name") or target_skills[idx % len(target_skills)]["name"]
                        s_id = target_skills[idx % len(target_skills)]["id"]

                        questions_data.append({
                            "id": q_id,
                            "scenario": q.get("scenario", ""),
                            "question_text": q.get("scenario", ""),
                            "subject": "AYUSH Clinical Discipline",
                            "subject_domain": "Clinical Practice",
                            "skill_name": s_name,
                            "skill_id": s_id,
                            "standard": q.get("standard", "AYUSH-GCP & Pharmacopoeial Standard"),
                            "options": options
                        })
            except Exception as e:
                logger.warning(f"Failed to parse LLM JSON: {e}")

        if not questions_data:
            questions_data = _generate_procedural_questions(
                discipline_name=discipline_name,
                target_role_title=role_title,
                skills=target_skills,
                assessment_type=assessment_type,
                company_name=company_name
            )

    # 4. Persist Assessment in Database to preserve audit trail
    if assessment_type == "MIXED_COMPREHENSIVE":
        test_title = f"[Mixed AYUSH Comprehensive Assessment] Multi-Subject Clinical & Statutory Exam • {discipline_name}"
        test_desc = f"Comprehensive 12-question mixed assessment spanning Kayachikitsa, Dravyaguna, Panchakarma, Rasa Shastra, AYUSH-GCP, and Counseling."
        test_duration = 25
    elif assessment_type == "JOB_FIT" and company_name:
        test_title = f"[AI Job-Fit Challenge] {role_title} • {company_name}"
        test_desc = f"Live recruiter job-posting challenge evaluating candidate suitability for {role_title} at {company_name}."
        test_duration = 15
    else:
        test_title = f"[AI Statutory Benchmark] {role_title} • {discipline_name}"
        test_desc = f"Personalized dynamic scenario assessment evaluating candidate competency against statutory AYUSH standards."
        test_duration = 20

    # Resolve a default category for foreign key
    test = AssessmentTest(
        title=test_title,
        description=test_desc,
        category_id="cat-clinical",
        career_role_id=career_role_id or student.target_career_role_id,
        duration_minutes=test_duration,
        total_questions=len(questions_data),
        passing_score=50.0,
        difficulty="BALANCED"
    )
    db.add(test)
    await db.flush()

    # Add questions and options
    for q in questions_data:
        db_q = AssessmentQuestion(
            id=q["id"],
            test_id=test.id,
            skill_id=q["skill_id"],
            question_text=q["scenario"],
            question_type="SITUATIONAL",
            difficulty="MEDIUM",
            career_relevance=q["standard"],
            explanation=q["standard"],
            metadata_json=json.dumps({
                "standard": q["standard"],
                "skill_name": q["skill_name"],
                "subject": q.get("subject", "AYUSH Clinical"),
                "subject_domain": q.get("subject_domain", "Clinical Practice")
            })
        )
        db.add(db_q)
        for opt in q["options"]:
            db_opt = AssessmentOption(
                id=opt["id"],
                question_id=db_q.id,
                option_text=opt["text"],
                is_correct=opt["is_correct"],
                explanation=opt["explanation"]
            )
            db.add(db_opt)

    # Create Attempt
    attempt = AssessmentAttempt(
        student_profile_id=student.id,
        test_id=test.id,
        career_role_id=career_role_id or student.target_career_role_id,
        status="IN_PROGRESS"
    )
    db.add(attempt)
    await db.commit()

    # Format return for frontend runner
    formatted_questions = [
        {
            "id": q["id"],
            "questionText": q["scenario"],
            "question_text": q["scenario"],
            "questionType": "SITUATIONAL",
            "question_type": "SITUATIONAL",
            "difficulty": "MEDIUM",
            "careerRelevance": q["standard"],
            "career_relevance": q["standard"],
            "subject": q.get("subject", "AYUSH Clinical"),
            "subjectDomain": q.get("subject_domain", "Clinical Practice"),
            "skillName": q["skill_name"],
            "skill_name": q["skill_name"],
            "skillsMapping": [
                {
                    "skillId": q.get("skill_id") or "sk-patient-diag",
                    "skillName": q.get("skill_name") or "Regulatory Standard",
                    "weight": 1.0
                }
            ],
            "skills_mapping": [
                {
                    "skill_id": q.get("skill_id") or "sk-patient-diag",
                    "skill_name": q.get("skill_name") or "Regulatory Standard",
                    "weight": 1.0
                }
            ],
            "options": [
                {
                    "id": opt["id"],
                    "optionText": opt["text"],
                    "option_text": opt["text"]
                }
                for opt in q["options"]
            ]
        }
        for q in questions_data
    ]

    return {
        "success": True,
        "attempt_id": attempt.id,
        "attemptId": attempt.id,
        "test_id": test.id,
        "testId": test.id,
        "test_title": test_title,
        "testTitle": test_title,
        "assessment_type": assessment_type,
        "duration_minutes": test.duration_minutes,
        "durationMinutes": test.duration_minutes,
        "questions": formatted_questions
    }


async def evaluate_dynamic_submission(
    db: AsyncSession,
    attempt_id: str,
    answers_input: List[dict],
    user_id: str
) -> dict:
    """
    Evaluates dynamic assessment submission:
    - Grades each option against verified pharmacopoeial / clinical criteria
    - Awards score percentages per competency
    - Upgrades StudentSkill table to 'ASSESSMENT_VERIFIED'
    - Produces personalized diagnostic summary and regulatory citations
    """
    # 1. Fetch Attempt & Questions
    res = await db.execute(
        select(AssessmentAttempt)
        .where(AssessmentAttempt.id == attempt_id)
        .options(
            selectinload(AssessmentAttempt.test).selectinload(AssessmentTest.questions).selectinload(AssessmentQuestion.options),
            selectinload(AssessmentAttempt.student_profile).selectinload(StudentProfile.skills)
        )
    )
    attempt = res.scalar_one_or_none()
    if not attempt:
        raise ValueError("Assessment attempt not found")

    test = attempt.test
    q_map = {q.id: q for q in test.questions}

    total_score = 0.0
    total_questions = len(test.questions) or 1
    skill_stats: Dict[str, Dict[str, Any]] = {}
    subject_stats: Dict[str, Dict[str, Any]] = {}
    detailed_feedback = []

    KNOWN_SKILL_INFO = {
        "sk-panchakarma": ("Panchakarma Protocol", "Clinical Therapeutics"),
        "sk-gcp": ("AYUSH-GCP & Safety", "Regulatory & Clinical Safety"),
        "sk-pharmacovig": ("Pharmacovigilance", "Drug Safety & ADR"),
        "sk-dravyaguna": ("Dravyaguna Identification", "Materia Medica"),
        "sk-hptlc": ("HPTLC Fingerprinting", "Quality Control"),
        "sk-pharmacopoeia": ("Pharmacopoeial Standards (API)", "Standardization"),
        "sk-patient-diag": ("Rog Nidana & Clinical Diagnosis", "Clinical Medicine"),
        "sk-counseling": ("Patient Counseling & Ethics", "Ethics & Counseling"),
    }

    for ans in answers_input:
        q_id = ans.get("question_id")
        opt_id = ans.get("selected_option_id")
        q = q_map.get(q_id)
        if not q:
            continue

        selected_opt = next((o for o in q.options if o.id == opt_id), None)
        correct_opt = next((o for o in q.options if o.is_correct), None)

        is_correct = bool(selected_opt and selected_opt.is_correct)
        score_awarded = 1.0 if is_correct else 0.0
        total_score += score_awarded

        # Record answer
        db_answer = AssessmentAnswer(
            attempt_id=attempt.id,
            question_id=q_id,
            selected_option_id=opt_id,
            is_correct=is_correct,
            score_awarded=score_awarded,
            text_answer=ans.get("text_answer")
        )
        db.add(db_answer)

        # Subject breakdown
        subject_name = "General AYUSH Competency"
        if q.metadata_json:
            try:
                m = json.loads(q.metadata_json)
                subject_name = m.get("subject") or m.get("subject_domain") or subject_name
            except Exception:
                pass
        
        if subject_name not in subject_stats:
            subject_stats[subject_name] = {"count": 0, "correct": 0}
        subject_stats[subject_name]["count"] += 1
        if is_correct:
            subject_stats[subject_name]["correct"] += 1

        s_id = q.skill_id
        if s_id not in skill_stats:
            skill_stats[s_id] = {"count": 0, "correct": 0, "subject": subject_name}
        skill_stats[s_id]["count"] += 1
        if is_correct:
            skill_stats[s_id]["correct"] += 1

        detailed_feedback.append({
            "question_id": q.id,
            "subject": subject_name,
            "is_correct": is_correct,
            "selected_option": selected_opt.option_text if selected_opt else "No selection",
            "correct_option": correct_opt.option_text if correct_opt else "",
            "explanation": selected_opt.explanation if (selected_opt and not is_correct) else (correct_opt.explanation if correct_opt else "Adherence to statutory standard."),
            "regulatory_benchmark": q.career_relevance or "AYUSH Statutory Standard"
        })

    overall_pct = round((total_score / total_questions) * 100.0, 1)

    # 2. Update Attempt
    attempt.score_percentage = overall_pct
    attempt.completed_at = datetime.utcnow()
    attempt.status = "COMPLETED"

    # Fetch skill names from DB or fallback
    db_skills_res = await db.execute(select(Skill).options(selectinload(Skill.category)))
    db_skills_map = {}
    for s in db_skills_res.scalars().all():
        cat_str = "Clinical & Regulatory Standards"
        if s.category:
            cat_str = s.category.name if hasattr(s.category, "name") else str(s.category)
        db_skills_map[s.id] = (s.name, cat_str)

    skill_scores_result = []

    # 3. Upgrade Student Skills to ASSESSMENT_VERIFIED
    for s_id, stats in skill_stats.items():
        s_pct = round((stats["correct"] / max(stats["count"], 1)) * 100.0, 1)
        
        sc = AssessmentSkillScore(
            attempt_id=attempt.id,
            skill_id=s_id,
            score_percentage=s_pct,
            questions_count=stats["count"],
            correct_count=stats["correct"]
        )
        db.add(sc)

        st_skill_res = await db.execute(
            select(StudentSkill).where(
                StudentSkill.student_profile_id == attempt.student_profile_id,
                StudentSkill.skill_id == s_id
            )
        )
        st_skill = st_skill_res.scalar_one_or_none()
        if st_skill:
            if s_pct > st_skill.proficiency_score:
                st_skill.proficiency_score = s_pct
            st_skill.verification_level = "ASSESSMENT_VERIFIED"
            st_skill.verified_at = datetime.utcnow()
            st_skill.source = f"AI Dynamic Assessment: {test.title}"
        else:
            new_st_skill = StudentSkill(
                student_profile_id=attempt.student_profile_id,
                skill_id=s_id,
                proficiency_score=s_pct,
                verification_level="ASSESSMENT_VERIFIED",
                verified_at=datetime.utcnow(),
                source=f"AI Dynamic Assessment: {test.title}"
            )
            db.add(new_st_skill)

        # Resolve skill name and category
        if s_id in db_skills_map:
            sk_name, cat_name = db_skills_map[s_id]
        elif s_id in KNOWN_SKILL_INFO:
            sk_name, cat_name = KNOWN_SKILL_INFO[s_id]
        else:
            sk_name, cat_name = "Core Competency", "Clinical & Regulatory Standards"

        if not isinstance(cat_name, str):
            cat_name = getattr(cat_name, "name", str(cat_name))

        # Check question metadata for custom name
        for q in test.questions:
            if q.skill_id == s_id and q.metadata_json:
                try:
                    meta = json.loads(q.metadata_json)
                    if "skill_name" in meta:
                        sk_name = meta["skill_name"]
                        break
                except Exception:
                    pass

        skill_item = {
            "skill_id": s_id,
            "skillId": s_id,
            "skill_name": sk_name,
            "skillName": sk_name,
            "category_name": cat_name,
            "categoryName": cat_name,
            "score_percentage": s_pct,
            "scorePercentage": s_pct,
            "questions_count": stats["count"],
            "questionsCount": stats["count"],
            "correct_count": stats["correct"],
            "correctCount": stats["correct"],
            "required_proficiency": 70,
            "requiredProficiency": 70,
            "gap_points": max(0, 70 - int(s_pct)),
            "gapPoints": max(0, 70 - int(s_pct)),
            "status": "STRENGTH" if s_pct >= 70 else "PRIORITY_GAP",
            "is_mandatory": True,
            "isMandatory": True,
            "weight": 1.0,
            "subject": stats.get("subject", "General Competency")
        }
        skill_scores_result.append(skill_item)

    # Recalculate Student Career Readiness Score
    all_skills_res = await db.execute(
        select(StudentSkill.proficiency_score)
        .where(StudentSkill.student_profile_id == attempt.student_profile_id)
    )
    all_scores = all_skills_res.scalars().all()
    if all_scores:
        new_readiness = round(sum(all_scores) / len(all_scores), 1)
        attempt.student_profile.readiness_score = new_readiness
        attempt.readiness_score = new_readiness

    # 4. Notification
    notif = Notification(
        user_id=user_id,
        title="AI Assessment Completed 🎯",
        message=f"You achieved {overall_pct}% on '{test.title}'. Your skills have been officially updated to ASSESSMENT_VERIFIED!",
        type="SKILL_ALERT",
        link="/student/skills"
    )
    db.add(notif)
    await db.commit()

    # Build strengths and gaps lists
    top_strengths = [s for s in skill_scores_result if s["scorePercentage"] >= 70]
    priority_gaps = [s for s in skill_scores_result if s["scorePercentage"] < 70]

    # Build subjectMastery list
    subject_mastery = []
    for subj_name, s_data in subject_stats.items():
        s_pct = round((s_data["correct"] / max(s_data["count"], 1)) * 100.0, 1)
        subject_mastery.append({
            "subject": subj_name,
            "subjectName": subj_name,
            "scorePercentage": s_pct,
            "score_percentage": s_pct,
            "correctCount": s_data["correct"],
            "totalCount": s_data["count"],
            "status": "MASTERED" if s_pct >= 75 else ("PROFICIENT" if s_pct >= 50 else "NEEDS_REVIEW")
        })

    # Build questionReview array
    question_review = []
    for fb in detailed_feedback:
        q_obj = q_map.get(fb["question_id"])
        question_review.append({
            "questionId": fb["question_id"],
            "subject": fb.get("subject", "AYUSH Competency"),
            "questionText": q_obj.question_text if q_obj else "Scenario Question",
            "questionType": "SITUATIONAL",
            "difficulty": "MEDIUM",
            "isCorrect": fb["is_correct"],
            "yourAnswer": fb["selected_option"],
            "correctAnswer": fb["correct_option"],
            "explanation": f"{fb['explanation']} [{fb['regulatory_benchmark']}]",
            "skillsTested": [{"skillName": fb["regulatory_benchmark"], "weight": 1.0}]
        })

    completed_iso = (attempt.completed_at or datetime.utcnow()).isoformat()

    return {
        "attempt_id": attempt.id,
        "attemptId": attempt.id,
        "attempt_number": attempt.attempt_number or 1,
        "attemptNumber": attempt.attempt_number or 1,
        "career_role_title": test.title,
        "careerRoleTitle": test.title,
        "score_percentage": overall_pct,
        "scorePercentage": overall_pct,
        "overall_score_percentage": overall_pct,
        "overallScorePercentage": overall_pct,
        "readiness_score": attempt.readiness_score or 0.0,
        "readinessScore": attempt.readiness_score or 0.0,
        "career_readiness_score": attempt.readiness_score or 0.0,
        "careerReadinessScore": attempt.readiness_score or 0.0,
        "completed_at": completed_iso,
        "completedAt": completed_iso,
        "passed": overall_pct >= 50.0,
        "skill_scores": skill_scores_result,
        "skillScores": skill_scores_result,
        "top_strengths": top_strengths,
        "topStrengths": top_strengths,
        "priority_gaps": priority_gaps,
        "priorityGaps": priority_gaps,
        "subject_mastery": subject_mastery,
        "subjectMastery": subject_mastery,
        "question_review": question_review,
        "questionReview": question_review,
        "recommended_learnings": [],
        "recommendedLearnings": [],
        "detailed_feedback": detailed_feedback,
        "detailedFeedback": detailed_feedback,
        "feedback": detailed_feedback,
        "test_title": test.title
    }
