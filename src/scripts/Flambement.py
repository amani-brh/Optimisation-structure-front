#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Vérification d'une pièce comprimée selon Eurocode 3 (EC3)
- Flambement dans les deux plans (yy et zz)
- Calcul systématique de φ et χ (même si λ̅ ≤ 0,2)
- Résistance de calcul : Nc,Rd = min(χ_y, χ_z) · A · fy / γM1
- λ1 calculé exactement : π·√(E/fy)
- Titre modifié : « Résistance plastique de la section brute » (bien que le calcul inclue le flambement)
- Génération d'une note de calcul professionnelle : PDF (si fpdf2 installé) ou HTML (toujours disponible)
- Affichage haute précision (non arrondi) – tableaux élégants et carrés
"""

import math
import datetime
import os
import webbrowser

# ---------- Gestion de l'import fpdf2 ----------
try:
    from fpdf import FPDF
    PDF_ACTIF = True
except ImportError:
    PDF_ACTIF = False
    print("\n⚠️  Module 'fpdf2' non installé. La génération du PDF sera désactivée.")
    print("   Pour activer le PDF : pip install fpdf2\n")

# ---------- Constantes ----------
E = 210000.0          # Module d'Young (MPa)
GAMMA_M1 = 1.1        # Coefficient partiel γM1
FY_DEFAULT = 235      # Limite d'élasticité par défaut (MPa)

# ---------- Base de données de profilés ----------
# Format : 'nom' : [ A (mm²), iy (mm), iz (mm), alpha_y, alpha_z ]
# alpha = facteur d'imperfection (EC3 Tab. 6.2)
sections_db = {
    'IPE100': [1030, 40.7, 12.4, 0.21, 0.34],
    'IPE200': [2850, 82.6, 22.3, 0.21, 0.34],
    'IPE300': [5380, 125,  33.5, 0.21, 0.34],
    'HEA100': [2120, 40.6, 25.1, 0.34, 0.49],
    'HEA200': [5380, 82.8, 49.9, 0.34, 0.49],
    'HEB100': [2600, 41.6, 25.3, 0.34, 0.49],
    'HEB200': [7810, 85.4, 50.6, 0.34, 0.49],
}

# ---------- Fonctions de saisie ----------
def saisie_texte(msg, obligatoire=True):
    while True:
        val = input(msg).strip()
        if val or not obligatoire:
            return val
        print("  ⚠️  Réponse obligatoire.")

def saisie_float(msg, min_val=None, default=None):
    while True:
        try:
            s = input(msg).strip()
            if s == '' and default is not None:
                return default
            val = float(s)
            if min_val is not None and val < min_val:
                print(f"  ⚠️  Doit être ≥ {min_val}.")
                continue
            return val
        except ValueError:
            print("  ⚠️  Entrez un nombre valide.")

# ---------- Génération PDF (style professionnel, tableaux carrés) ----------
def generer_pdf(donnees):
    """Génère une note de calcul au format PDF – mise en page classique et élégante."""
    if not PDF_ACTIF:
        print("  ❌ Impossible de générer le PDF : module fpdf2 manquant.")
        return

    pdf = FPDF()
    pdf.add_page()

    # --- Gestion de la police Unicode ---
    unicode_font_path = "DejaVuSans.ttf"
    use_unicode = os.path.isfile(unicode_font_path)
    if use_unicode:
        pdf.add_font("DejaVu", "", unicode_font_path, uni=True)
        pdf.set_font("DejaVu", "", 10)
        pdf.set_font("DejaVu", "B", 12)
        print("  ✅ Police Unicode chargée (DejaVuSans.ttf) – symboles grecs présents.")
    else:
        pdf.set_font("Helvetica", "", 10)
        pdf.set_font("Helvetica", "B", 12)
        print("  ⚠️  Police Unicode non trouvée. Les symboles grecs seront remplacés par leur nom.")

    # --- Fonction de nettoyage pour fallback ---
    def safe_text(txt):
        if not use_unicode:
            replacements = {
                'α': 'alpha',
                'λ': 'lambda',
                'φ': 'phi',
                'χ': 'chi',
                'ε': 'epsilon',
                '̅': '',        # macron
                '²': '^2',
                '√': 'sqrt',
                'π': 'pi',
                'θ': 'theta',
                'γ': 'gamma',
                'η': 'eta',
                'μ': 'mu',
                'σ': 'sigma',
                'τ': 'tau',
                'ω': 'omega',
                'Δ': 'Delta',
                'Σ': 'Sigma',
            }
            for k, v in replacements.items():
                txt = txt.replace(k, v)
        return txt

    # --- Encadrement de la page (style professionnel) ---
    pdf.set_draw_color(80, 80, 80)
    pdf.set_line_width(0.5)
    pdf.rect(5, 5, 200, 287)

    # --- En-tête ---
    pdf.set_font(pdf.font_family, 'B', 16)
    pdf.set_text_color(10, 60, 80)
    pdf.cell(0, 10, safe_text("NOTE DE CALCUL – EUROCODE 3"), ln=True, align='C')
    pdf.set_text_color(0, 0, 0)
    pdf.set_font(pdf.font_family, '', 11)
    pdf.cell(0, 8, safe_text("Vérification d'une pièce comprimée selon NF EN 1993-1-1"), ln=True, align='C')
    pdf.ln(4)

    pdf.set_font(pdf.font_family, 'I', 10)
    pdf.cell(0, 6, safe_text(f"Date : {datetime.datetime.now():%d/%m/%Y %H:%M}"), ln=True, align='R')
    pdf.ln(6)

    # --- 1. Données d'entrée ---
    pdf.set_font(pdf.font_family, 'B', 12)
    pdf.set_fill_color(42, 157, 143)   # Vert bleuté
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 8, safe_text("1. DONNÉES D'ENTRÉE"), ln=True, fill=True)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font(pdf.font_family, '', 10)
    pdf.ln(2)

    # Grille des données
    pdf.set_font(pdf.font_family, 'B', 10)
    pdf.cell(50, 6, safe_text("Profilé:"), 0)
    pdf.set_font(pdf.font_family, '', 10)
    pdf.cell(0, 6, safe_text(f"{donnees['section']}"), ln=True)
    
    pdf.set_font(pdf.font_family, 'B', 10)
    pdf.cell(50, 6, safe_text("Aire A:"), 0)
    pdf.set_font(pdf.font_family, '', 10)
    pdf.cell(0, 6, safe_text(f"{donnees['A']:.0f} mm²"), ln=True)
    
    pdf.set_font(pdf.font_family, 'B', 10)
    pdf.cell(50, 6, safe_text("Rayons de giration:"), 0)
    pdf.set_font(pdf.font_family, '', 10)
    pdf.cell(0, 6, safe_text(f"iy = {donnees['iy']:.2f} mm, iz = {donnees['iz']:.2f} mm"), ln=True)
    
    pdf.set_font(pdf.font_family, 'B', 10)
    pdf.cell(50, 6, safe_text("α facteur d’imperfection:"), 0)
    pdf.set_font(pdf.font_family, '', 10)
    pdf.cell(0, 6, safe_text(f"αy = {donnees['alpha_y']}, αz = {donnees['alpha_z']}"), ln=True)
    
    pdf.set_font(pdf.font_family, 'B', 10)
    pdf.cell(50, 6, safe_text("Longueur L:"), 0)
    pdf.set_font(pdf.font_family, '', 10)
    pdf.cell(0, 6, safe_text(f"{donnees['L_m']:.3f} m"), ln=True)
    
    pdf.set_font(pdf.font_family, 'B', 10)
    pdf.cell(50, 6, safe_text("Facteurs flambement:"), 0)
    pdf.set_font(pdf.font_family, '', 10)
    pdf.cell(0, 6, safe_text(f"ky = {donnees['ky']}, kz = {donnees['kz']}"), ln=True)
    
    pdf.set_font(pdf.font_family, 'B', 10)
    pdf.cell(50, 6, safe_text("Longueurs flambement:"), 0)
    pdf.set_font(pdf.font_family, '', 10)
    pdf.cell(0, 6, safe_text(f"Lcr,y = {donnees['Lcr_y']:.0f} mm, Lcr,z = {donnees['Lcr_z']:.0f} mm"), ln=True)
    
    pdf.set_font(pdf.font_family, 'B', 10)
    pdf.cell(50, 6, safe_text("Effort N_Ed:"), 0)
    pdf.set_font(pdf.font_family, '', 10)
    pdf.cell(0, 6, safe_text(f"{donnees['N_Ed_kN']:.3f} kN"), ln=True)
    
    pdf.set_font(pdf.font_family, 'B', 10)
    pdf.cell(50, 6, safe_text("Acier:"), 0)
    pdf.set_font(pdf.font_family, '', 10)
    pdf.cell(0, 6, safe_text(f"fy = {donnees['fy']} MPa, γM1 = {GAMMA_M1}"), ln=True)
    pdf.ln(8)

    # --- 2. Calculs intermédiaires ---
    pdf.set_font(pdf.font_family, 'B', 12)
    pdf.set_fill_color(42, 157, 143)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 8, safe_text("2. CALCULS INTERMÉDIAIRES"), ln=True, fill=True)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font(pdf.font_family, '', 10)
    pdf.ln(2)

    # λ1 exact
    pdf.cell(0, 6, safe_text(f"λ1 = π·√(E/fy) = π·√({E}/{donnees['fy']}) = {donnees['lambda1']:.3f}"), ln=True)
    pdf.ln(4)

    # --- Tableau comparatif (carré, sans fioritures) ---
    pdf.set_font(pdf.font_family, 'B', 10)
    pdf.set_fill_color(31, 78, 95)   # Bleu foncé
    pdf.set_text_color(255, 255, 255)
    col_width = 70
    pdf.cell(col_width, 8, safe_text("Paramètre"), border=1, fill=True, align='C')
    pdf.cell(col_width, 8, safe_text("Plan yy (y-y)"), border=1, fill=True, align='C')
    pdf.cell(col_width, 8, safe_text("Plan zz (z-z)"), border=1, fill=True, align='C')
    pdf.ln()
    pdf.set_text_color(0, 0, 0)
    pdf.set_font(pdf.font_family, '', 10)

    lignes = [
        ("Lcr (mm)", f"{donnees['Lcr_y']:.0f}", f"{donnees['Lcr_z']:.0f}"),
        ("i (mm)", f"{donnees['iy']:.2f}", f"{donnees['iz']:.2f}"),
        ("λ = Lcr / i", f"{donnees['lambda_y']:.3f}", f"{donnees['lambda_z']:.3f}"),
        ("λ̅ = λ / λ1", f"{donnees['lam_bar_y']:.4f}", f"{donnees['lam_bar_z']:.4f}"),
        ("α", f"{donnees['alpha_y']}", f"{donnees['alpha_z']}"),
        ("φ = 0,5[1+α(λ̅-0,2)+λ̅²]", f"{donnees['phi_y']:.5f}", f"{donnees['phi_z']:.5f}"),
        ("χ (formule)", f"{donnees['chi_y_formule']:.5f}", f"{donnees['chi_z_formule']:.5f}"),
    ]

    for label, val_y, val_z in lignes:
        pdf.cell(col_width, 7, safe_text(label), border=1, align='L')
        pdf.cell(col_width, 7, safe_text(val_y), border=1, align='R')
        pdf.cell(col_width, 7, safe_text(val_z), border=1, align='R')
        pdf.ln()
    pdf.ln(6)

    # --- 3. Résistance plastique de la section brute (avec prise en compte du flambement) ---
    pdf.set_font(pdf.font_family, 'B', 12)
    pdf.set_fill_color(42, 157, 143)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 8, safe_text("3. RÉSISTANCE PLASTIQUE DE LA SECTION BRUTE"), ln=True, fill=True)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font(pdf.font_family, '', 11)
    pdf.ln(2)

    pdf.set_font(pdf.font_family, 'B', 11)
    pdf.cell(50, 7, safe_text("χ_min = min(χ_y, χ_z) :"), 0)
    pdf.set_font(pdf.font_family, '', 11)
    pdf.cell(0, 7, safe_text(f"min({donnees['chi_y_utilise']:.5f}, {donnees['chi_z_utilise']:.5f}) = {donnees['chi_min']:.5f}"), ln=True)
    pdf.ln(2)

    pdf.set_font(pdf.font_family, 'B', 11)
    pdf.cell(50, 7, safe_text("Nc,Rd = χ_min · A · fy / γM1 :"), 0)
    pdf.set_font(pdf.font_family, '', 11)
    pdf.cell(0, 7, safe_text(f"{donnees['chi_min']:.5f} × {donnees['A']:.0f} × {donnees['fy']} / {GAMMA_M1} = {donnees['Nc_Rd']:.3f} kN"), ln=True)
    pdf.ln(4)

    pdf.set_font(pdf.font_family, 'B', 11)
    pdf.cell(50, 7, safe_text("N_Ed / Nc,Rd :"), 0)
    pdf.set_font(pdf.font_family, '', 11)
    pdf.cell(0, 7, safe_text(f"{donnees['N_Ed_kN']:.3f} / {donnees['Nc_Rd']:.3f} = {donnees['ratio_global']:.4f}"), ln=True)
    pdf.ln(6)

    # --- Conclusion ---
    pdf.set_font(pdf.font_family, 'B', 12)
    condition_ok = donnees['ratio_global'] <= 1.0
    if condition_ok:
        pdf.set_text_color(0, 128, 0)
        pdf.cell(0, 8, safe_text("✓ N_Ed ≤ Nc,Rd → condition satisfaite"), ln=True)
        pdf.ln(4)
        pdf.set_font(pdf.font_family, 'B', 14)
        pdf.cell(0, 10, safe_text("✅ CONDITION SATISFAITE"), ln=True, align='C')
    else:
        pdf.set_text_color(255, 0, 0)
        pdf.cell(0, 8, safe_text("✗ N_Ed > Nc,Rd → condition non satisfaite"), ln=True)
        pdf.ln(4)
        pdf.set_font(pdf.font_family, 'B', 14)
        pdf.cell(0, 10, safe_text("❌ CONDITION NON SATISFAITE"), ln=True, align='C')
    pdf.set_text_color(0, 0, 0)

    # --- Pied de page ---
    pdf.set_y(-30)
    pdf.set_font(pdf.font_family, 'I', 9)
    pdf.cell(0, 6, safe_text("EC3 Checker – Note de calcul générée automatiquement – NF EN 1993-1-1 §6.3.1"), 0, align='C')
    pdf.cell(0, 6, safe_text(f"γM1 = {GAMMA_M1} – χ = min(χ_y, χ_z) – λ1 = π·√(E/fy)"), 0, align='C')

    # --- Sauvegarde ---
    nom_fichier = f"note_calcul_EC3_{datetime.datetime.now():%Y%m%d_%H%M%S}.pdf"
    pdf.output(nom_fichier)
    print(f"\n📄 Note de calcul PDF générée : {nom_fichier}")

# ---------- Génération HTML (moderne, haute précision) ----------
def generer_html(donnees):
    """Génère une note de calcul au format HTML professionnel – sobre et élégant."""
    nom_fichier = f"note_calcul_EC3_{datetime.datetime.now():%Y%m%d_%H%M%S}.html"
    
    condition_ok = donnees['ratio_global'] <= 1.0
    date_affichage = datetime.datetime.now().strftime("%d/%m/%Y à %H:%M")

    html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Note de calcul EC3 – Pièce comprimée</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            background: #f5f7fa;
            color: #2c3e50;
            line-height: 1.5;
            padding: 30px 20px;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border: 1px solid #d1d9e6;
            padding: 35px 40px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }}
        h1 {{
            font-size: 24px;
            font-weight: 600;
            color: #1e3d58;
            border-left: 6px solid #2c7a7b;
            padding-left: 18px;
            margin-top: 0;
            margin-bottom: 10px;
        }}
        h2 {{
            font-size: 18px;
            font-weight: 600;
            color: #1e3d58;
            margin: 30px 0 12px 0;
            border-bottom: 1px solid #b0c4ce;
            padding-bottom: 5px;
        }}
        .header-meta {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #ecf3f0;
            padding: 12px 20px;
            margin-bottom: 25px;
            border: 1px solid #cbd5e0;
        }}
        .date {{
            font-size: 14px;
            color: #2c3e50;
            background: white;
            padding: 4px 14px;
            border: 1px solid #b8c9d4;
        }}
        .badge {{
            background: #2c7a7b;
            color: white;
            padding: 4px 16px;
            font-weight: 600;
            font-size: 13px;
            border: 1px solid #1f4e4f;
        }}
        .card {{
            background: white;
            border: 1px solid #dce5ec;
            padding: 20px 25px;
            margin-bottom: 25px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            margin: 15px 0 5px;
            border: 1px solid #cbd5e0;
        }}
        th {{
            background: #2c5f73;
            color: white;
            font-weight: 600;
            padding: 10px 8px;
            text-align: left;
            border: 1px solid #1f4757;
        }}
        td {{
            padding: 8px 8px;
            border: 1px solid #e2e8f0;
            background-color: white;
        }}
        tr:nth-child(even) td {{
            background-color: #f9fbfd;
        }}
        td:first-child {{
            font-weight: 500;
            color: #1e3d58;
        }}
        td:not(:first-child) {{
            font-family: 'Consolas', 'Monaco', monospace;
        }}
        .value-yy {{
            color: #1f5f5f;
        }}
        .value-zz {{
            color: #2c7a7b;
        }}
        .formule {{
            background: #f2f6f9;
            padding: 15px 20px;
            margin: 20px 0 10px;
            border: 1px solid #cddae5;
            font-size: 15px;
        }}
        .ratio-line {{
            display: flex;
            align-items: baseline;
            gap: 15px;
            flex-wrap: wrap;
            padding: 12px 0;
            border-top: 1px solid #e2e8f0;
            margin-top: 15px;
            font-size: 16px;
        }}
        .ratio-value {{
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 20px;
            font-weight: 600;
            color: #1e3d58;
            background: #edf2f7;
            padding: 4px 12px;
            border: 1px solid #cbd5e0;
        }}
        .verdict {{
            font-weight: 600;
            margin-left: 10px;
        }}
        .verdict-ok {{
            color: #1f7a4c;
        }}
        .verdict-ko {{
            color: #b34141;
        }}
        .result-card {{
            background: #ecf3f7;
            padding: 25px 30px;
            margin-top: 30px;
            border: 1px solid #b8c9d4;
            text-align: center;
        }}
        .footer {{
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #5f6c7a;
            border-top: 1px solid #d0dbe8;
            padding-top: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1> NOTE DE CALCUL – EUROCODE 3</h1>
        <div class="header-meta">
            <span class="date"> {date_affichage}</span>
            <span class="badge">Pièce comprimée • EC3 §6.3.1</span>
        </div>

        <!-- 1. Données d'entrée -->
        <h2>1. Données d'entrée</h2>
        <div class="card">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                <div><strong style="color: #1f5f5f;">Profilé</strong><br>{donnees['section']}</div>
                <div><strong style="color: #1f5f5f;">Aire A</strong><br>{donnees['A']:.0f} mm²</div>
                <div><strong style="color: #1f5f5f;">Rayons de giration</strong><br>iy = {donnees['iy']:.2f} mm iz = {donnees['iz']:.2f} mm</div>
                <div><strong style="color: #1f5f5f;">α (imperfection)</strong><br>αy = {donnees['alpha_y']} αz = {donnees['alpha_z']}</div>
                <div><strong style="color: #1f5f5f;">Longueur L</strong><br>{donnees['L_m']:.3f} m</div>
                <div><strong style="color: #1f5f5f;">Facteurs flambement</strong><br>ky = {donnees['ky']} kz = {donnees['kz']}</div>
                <div><strong style="color: #1f5f5f;">Longueurs flambement</strong><br>Lcr,y = {donnees['Lcr_y']:.0f} mm Lcr,z = {donnees['Lcr_z']:.0f} mm</div>
                <div><strong style="color: #1f5f5f;">Effort N_Ed</strong><br>{donnees['N_Ed_kN']:.3f} kN</div>
                <div><strong style="color: #1f5f5f;">Acier</strong><br>fy = {donnees['fy']} MPa γM1 = {GAMMA_M1}</div>
            </div>
        </div>

        <!-- 2. Calculs intermédiaires -->
        <h2>2. Calculs intermédiaires</h2>
        <div class="card">
            <p style="margin-bottom: 12px; font-size: 15px;">
                <strong>λ₁</strong> = π·√(E/fy) = π·√({E}/{donnees['fy']}) = <strong>{donnees['lambda1']:.3f}</strong>
            </p>
            <table>
                <thead>
                    <tr><th>Paramètre</th><th>Plan yy (y-y)</th><th>Plan zz (z-z)</th></tr>
                </thead>
                <tbody>
                    <tr><td>Lcr (mm)</td><td class="value-yy">{donnees['Lcr_y']:.0f}</td><td class="value-zz">{donnees['Lcr_z']:.0f}</td></tr>
                    <tr><td>i (mm)</td><td class="value-yy">{donnees['iy']:.2f}</td><td class="value-zz">{donnees['iz']:.2f}</td></tr>
                    <tr><td>λ = Lcr / i</td><td class="value-yy">{donnees['lambda_y']:.3f}</td><td class="value-zz">{donnees['lambda_z']:.3f}</td></tr>
                    <tr><td>λ̅ = λ / λ₁</td><td class="value-yy">{donnees['lam_bar_y']:.4f}</td><td class="value-zz">{donnees['lam_bar_z']:.4f}</td></tr>
                    <tr><td>α</td><td class="value-yy">{donnees['alpha_y']}</td><td class="value-zz">{donnees['alpha_z']}</td></tr>
                    <tr><td>φ = 0,5[1+α(λ̅-0,2)+λ̅²]</td><td class="value-yy">{donnees['phi_y']:.5f}</td><td class="value-zz">{donnees['phi_z']:.5f}</td></tr>HEA200
                    <tr><td>χ =1/φ+(√φ²+λ̅²)</td><td class="value-yy">{donnees['chi_y_formule']:.5f}</td><td class="value-zz">{donnees['chi_z_formule']:.5f}</td></tr>
                </tbody>
            </table>
        </div>

        <!-- 3. Résistance plastique de la section brute -->
        <h2>3. Résistance plastique de la section brute</h2>
        <div class="card">
            <div style="display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 15px;">
                <span style="font-size: 16px; font-weight: 600; color: #1e3d58;">χ_min = min(χ_y, χ_z)</span>
                <span style="font-size: 17px; font-weight: 600; background: #edf2f7; padding: 4px 14px; border: 1px solid #a0b8c5;">
                    min({donnees['chi_y_utilise']:.5f}, {donnees['chi_z_utilise']:.5f}) = <span style="color: #1f5f5f;">{donnees['chi_min']:.5f}</span>
                </span>
            </div>
            
            <div class="formule">
                <p style="font-size: 16px; font-weight: 600; color: #1e3d58; margin-bottom: 6px;">Nc,Rd = χ_min · A · fy / γM1</p>
                <p style="font-size: 15px; background: white; padding: 8px 14px; border: 1px solid #ccdbe8; font-family: monospace;">
                    = {donnees['chi_min']:.5f} × {donnees['A']:.0f} × {donnees['fy']} / {GAMMA_M1} = <strong>{donnees['Nc_Rd']:.3f} kN</strong>
                </p>
            </div>

            <!-- Ligne de ratio sobre et professionnelle -->
            <div class="ratio-line">
                <span style="font-weight: 600;">N_Ed / Nc,Rd</span>
                <span>=</span>
                <span class="ratio-value">{donnees['ratio_global']:.4f}</span>
                <span style="margin-left: 5px;">→</span>
                <span class="verdict {'verdict-ok' if condition_ok else 'verdict-ko'}">
                    {'✓ N_Ed ≤ Nc,Rd' if condition_ok else '✗ N_Ed > Nc,Rd'}
                </span>
            </div>
        </div>

        <!-- Synthèse finale -->
        <div class="result-card">
            <div style="font-size: 20px; font-weight: 600; margin-bottom: 10px; color: {'#1f7a4c' if condition_ok else '#b34141'};">
                {'CONDITION SATISFAITE' if condition_ok else 'CONDITION NON SATISFAITE'}
            </div>
            <div style="font-size: 16px; display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
                <span>Nc,Rd = <strong>{donnees['Nc_Rd']:.3f} kN</strong></span>
                <span>Ratio = <strong>{donnees['ratio_global']:.4f}</strong></span>
                <span style="font-weight: 600; color: {'#1f7a4c' if condition_ok else '#b34141'};">
                    {'≤ 1,0 ✓' if condition_ok else '> 1,0 ✗'}
                </span>
            </div>
        </div>

        <div class="footer">
            <strong>EC3 Checker</strong> • Note de calcul générée automatiquement • NF EN 1993-1-1 §6.3.1<br>
            λ₁ = π·√(E/fy) – χ = min(χ_y, χ_z) – γM1 = {GAMMA_M1}
        </div>
    </div>
</body>
</html>"""
    
    with open(nom_fichier, 'w', encoding='utf-8') as f:
        f.write(html)
    
    webbrowser.open('file://' + os.path.realpath(nom_fichier))
    print(f"\n🌐 Rapport HTML généré : {nom_fichier}")

# ---------- Programme principal ----------
def main():
    print("=" * 60)
    print(" VÉRIFICATION D'UNE PIÈCE COMPRIMÉE SELON EUROCODE 3")
    print("=" * 60)

    # --- Profilé ---
    print("\n--- PROFILÉ ---")
    print("Profilés disponibles :")
    for nom in sorted(sections_db.keys()):
        print(f"   - {nom}")
    print("   - 'custom' pour entrer manuellement")
    while True:
        section = saisie_texte("Nom du profilé : ").upper()
        if section == 'CUSTOM':
            A = saisie_float("  Aire A (mm²) : ", min_val=1)
            iy = saisie_float("  Rayon de giration iy (mm) : ", min_val=1)
            iz = saisie_float("  Rayon de giration iz (mm) : ", min_val=1)
            alpha_y = saisie_float("  Facteur d'imperfection αy : ", min_val=0)
            alpha_z = saisie_float("  Facteur d'imperfection αz : ", min_val=0)
            break
        elif section in sections_db:
            A, iy, iz, alpha_y, alpha_z = sections_db[section]
            print(f"  → A = {A:.0f} mm², iy = {iy:.1f} mm, iz = {iz:.1f} mm")
            print(f"     αy = {alpha_y}, αz = {alpha_z}")
            break
        else:
            print("  ⚠️  Profilé non trouvé. Choisissez dans la liste ou tapez 'custom'.")

    # --- Longueurs ---
    print("\n--- LONGUEURS DE FLAMBEMENT ---")
    L_m = saisie_float("Longueur réelle L (m) : ", min_val=0.01)
    L_mm = L_m * 1000.0

    ky = saisie_float("Facteur de flambement plan yy (défaut 1.0) : ", default=1.0, min_val=0.1)
    kz = saisie_float("Facteur de flambement plan zz (défaut 1.0) : ", default=1.0, min_val=0.1)

    Lcr_y = ky * L_mm
    Lcr_z = kz * L_mm

    # --- Effort ---
    print("\n--- EFFORT ---")
    N_Ed_kN = saisie_float("Effort axial de compression N_Ed (kN) : ", min_val=0)

    # --- Matériau ---
    print("\n--- MATÉRIAU ---")
    print("Nuances : S235, S275, S355")
    nuance = saisie_texte("Nuance : ").upper()
    if nuance == 'S235':
        fy = 235
    elif nuance == 'S275':
        fy = 275
    elif nuance == 'S355':
        fy = 355
    else:
        fy = saisie_float(f"fy personnalisé (MPa) [défaut {FY_DEFAULT}] : ", default=FY_DEFAULT, min_val=1)
        print(f"  → fy = {fy} MPa")

    # --- Calculs avec λ1 exact ---
    lambda1 = math.pi * math.sqrt(E / fy)

    # Plan yy
    lambda_y = Lcr_y / iy
    lam_bar_y = lambda_y / lambda1
    phi_y = 0.5 * (1.0 + alpha_y * (lam_bar_y - 0.2) + lam_bar_y ** 2)
    discriminant_y = max(phi_y ** 2 - lam_bar_y ** 2, 0.0)
    chi_y_formule = 1.0 / (phi_y + math.sqrt(discriminant_y))
    chi_y_utilise = 1.0 if lam_bar_y <= 0.2 else chi_y_formule

    # Plan zz
    lambda_z = Lcr_z / iz
    lam_bar_z = lambda_z / lambda1
    phi_z = 0.5 * (1.0 + alpha_z * (lam_bar_z - 0.2) + lam_bar_z ** 2)
    discriminant_z = max(phi_z ** 2 - lam_bar_z ** 2, 0.0)
    chi_z_formule = 1.0 / (phi_z + math.sqrt(discriminant_z))
    chi_z_utilise = 1.0 if lam_bar_z <= 0.2 else chi_z_formule

    # Résistance au flambement avec χ minimum
    chi_min = min(chi_y_utilise, chi_z_utilise)
    Nc_Rd = chi_min * A * fy / GAMMA_M1 / 1000.0
    ratio = N_Ed_kN / Nc_Rd if Nc_Rd > 0 else float('inf')

    # --- Affichage console (haute précision) ---
    print("\n" + "=" * 60)
    print(" RÉSULTATS")
    print("=" * 60)
    print(f"Profilé           : {section}")
    print(f"Longueur L        : {L_m:.3f} m")
    print(f"N_Ed              : {N_Ed_kN:.3f} kN")
    print(f"Acier            : fy = {fy} MPa, γM1 = {GAMMA_M1}")
    print(f"λ1 = π·√(E/fy)   : {lambda1:.3f}")
    print("-" * 60)
    print("                 PLAN yy (y-y)      PLAN zz (z-z)")
    print("-" * 60)
    print(f"Lcr (mm)         : {Lcr_y:.1f}            {Lcr_z:.1f}")
    print(f"i (mm)           : {iy:.2f}             {iz:.2f}")
    print(f"λ                : {lambda_y:.3f}           {lambda_z:.3f}")
    print(f"λ̅                : {lam_bar_y:.4f}          {lam_bar_z:.4f}")
    print(f"α                : {alpha_y}              {alpha_z}")
    print(f"φ (phi)          : {phi_y:.5f}          {phi_z:.5f}")
    print(f"χ (formule)      : {chi_y_formule:.5f}          {chi_z_formule:.5f}")
    print(f"χ (utilisé)      : {chi_y_utilise:.5f}          {chi_z_utilise:.5f}  (EC3 : =1 si λ̅≤0,2)")
    print("-" * 60)
    print(f"χ_min = min(χ_y, χ_z) = {chi_min:.5f}")
    print(f"Nc,Rd = χ_min · A · fy / γM1 = {Nc_Rd:.3f} kN")
    print(f"N_Ed / Nc,Rd     = {ratio:.4f}")
    print("=" * 60)

    print("\n--- VÉRIFICATION EC3 ---")
    if ratio <= 1.0:
        print("✓ N_Ed ≤ Nc,Rd → condition satisfaite")
    else:
        print("✗ N_Ed > Nc,Rd → condition non satisfaite")

    if ratio <= 1.0:
        print("\n✅ CONDITION SATISFAITE")
    else:
        print("\n❌ CONDITION NON SATISFAITE")
        print(f"   - Ratio : {ratio:.4f} > 1")

    print("\n" + "=" * 60)

    # --- Regroupement des données pour le rapport ---
    donnees_rapport = {
        'section': section,
        'A': A, 'iy': iy, 'iz': iz,
        'alpha_y': alpha_y, 'alpha_z': alpha_z,
        'L_m': L_m, 'ky': ky, 'kz': kz,
        'Lcr_y': Lcr_y, 'Lcr_z': Lcr_z,
        'N_Ed_kN': N_Ed_kN,
        'fy': fy,
        'lambda1': lambda1,
        'lambda_y': lambda_y, 'lambda_z': lambda_z,
        'lam_bar_y': lam_bar_y, 'lam_bar_z': lam_bar_z,
        'phi_y': phi_y, 'phi_z': phi_z,
        'chi_y_formule': chi_y_formule, 'chi_z_formule': chi_z_formule,
        'chi_y_utilise': chi_y_utilise, 'chi_z_utilise': chi_z_utilise,
        'chi_min': chi_min,
        'Nc_Rd': Nc_Rd,
        'ratio_global': ratio,
    }

    # --- Proposition de génération de rapport ---
    print("\n📄 Souhaitez-vous générer une note de calcul ?")
    print("   1 - PDF (nécessite fpdf2 installé) – version professionnelle")
    print("   2 - HTML (ouvre dans le navigateur, sans dépendance) – design moderne")
    print("   0 - Non")
    choix = saisie_texte("   Votre choix (0/1/2) : ")

    if choix == '1' and PDF_ACTIF:
        generer_pdf(donnees_rapport)
    elif choix == '1' and not PDF_ACTIF:
        print("  ❌ fpdf2 non installé. Impossible de générer le PDF.")
        print("     Installez-le avec : pip install fpdf2")
        rep = saisie_texte("   Générer le rapport HTML à la place ? (o/n) : ").lower()
        if rep in ('o', 'oui'):
            generer_html(donnees_rapport)
    elif choix == '2':
        generer_html(donnees_rapport)
    else:
        print("  Aucun rapport généré.")

    print("\n" + "=" * 60)
    print(" FIN DU PROGRAMME")
    print("=" * 60)

if __name__ == "__main__":
    main()