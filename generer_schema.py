#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont

W, H = 1100, 700
img = Image.new('RGB', (W, H), 'white')
d = ImageDraw.Draw(img)

# Couleurs
ORANGE, BLUE, RED = '#FC6D26', '#326CE5', '#EE0000'
CYAN, GREEN, NAVY, PURPLE = '#00A8E8', '#68A063', '#336791', '#9B59B6'
GRAY, BLACK = '#666', '#333'

try:
    F = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 12)
    FB = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
    FT = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
except:
    F = FB = FT = ImageFont.load_default()

def box(x, y, w, h, col, txt):
    d.rectangle([x, y, x+w, y+h], fill=col, outline=BLACK, width=2)
    lines = txt.split('\n')
    for i, line in enumerate(lines):
        d.text((x+8, y+6+i*15), line, fill='white', font=FB if i==0 else F)

def arrow(x1, y1, x2, y2, label=''):
    d.line([x1, y1, x2, y2], fill=GRAY, width=2)
    # Tête de flèche
    if x1 == x2:  # Vertical
        if y2 > y1:
            d.polygon([(x2, y2), (x2-5, y2-10), (x2+5, y2-10)], fill=GRAY)
        else:
            d.polygon([(x2, y2), (x2-5, y2+10), (x2+5, y2+10)], fill=GRAY)
    else:  # Horizontal
        if x2 > x1:
            d.polygon([(x2, y2), (x2-10, y2-5), (x2-10, y2+5)], fill=GRAY)
        else:
            d.polygon([(x2, y2), (x2+10, y2-5), (x2+10, y2+5)], fill=GRAY)
    if label:
        mx, my = (x1+x2)//2, (y1+y2)//2
        bbox = d.textbbox((0,0), label, font=F)
        tw = bbox[2] - bbox[0]
        d.rectangle([mx-tw//2-3, my-9, mx+tw//2+3, my+7], fill='white')
        d.text((mx-tw//2, my-8), label, fill=GRAY, font=F)

# === TITRE ===
d.text((30, 10), "Architecture - Vote App sur K3s", fill=BLACK, font=FT)

# === COLONNE GAUCHE ===
box(20, 50, 130, 45, '#555', "MACHINE HOTE\nPoste dev")
box(20, 120, 130, 90, ORANGE, "GITLAB.COM\n\nPipeline CI/CD\nBuild images\nRegistry")
box(20, 235, 130, 40, RED, "ANSIBLE\ndeploy.yml")

# === CLUSTER K3s ===
d.rectangle([320, 45, 1080, 380], outline=BLUE, width=3)
d.text((335, 52), "CLUSTER KUBERNETES (K3s)", fill=BLUE, font=FB)

# VMs
box(340, 80, 160, 70, '#4A90E2', "VM MASTER\n192.168.64.2\nControl Plane")
box(520, 80, 160, 70, '#5CA0F2', "VM WORKER\n192.168.64.3\nNodePort :30080")

# Ligne entre VMs
d.line([500, 115, 520, 115], fill=BLACK, width=2)

# Namespace
d.rectangle([335, 170, 1070, 370], outline='#bbb', width=1)
d.text((345, 175), "namespace: vote", fill='#999', font=F)

# === PODS (bien alignés horizontalement) ===
box(350, 210, 150, 145, CYAN, "FRONTEND\nnginx:alpine\n\nPort: 80\n\nService:\nNodePort 30080")
box(540, 210, 150, 145, GREEN, "BACKEND\nnode:18-alpine\n\nPort: 5000\n\nService:\nClusterIP")
box(730, 210, 150, 145, NAVY, "POSTGRESQL\npostgres:15\n\nPort: 5432\n\nService:\nClusterIP")

# === FLECHES DEPLOIEMENT ===

# 1. Machine Hote -> GitLab
arrow(85, 95, 85, 120, "git push")

# 2. GitLab -> VM Master (pull images)
d.line([150, 165, 250, 165], fill=GRAY, width=2)
d.line([250, 165, 250, 115], fill=GRAY, width=2)
d.line([250, 115, 340, 115], fill=GRAY, width=2)
d.polygon([(340, 115), (330, 110), (330, 120)], fill=GRAY)
d.rectangle([170, 150, 240, 168], fill='white')
d.text((175, 152), "pull images", fill=GRAY, font=F)

# 3. Ansible -> VM Master (SSH)
d.line([150, 255, 280, 255], fill=GRAY, width=2)
d.line([280, 255, 280, 130], fill=GRAY, width=2)
d.line([280, 130, 340, 130], fill=GRAY, width=2)
d.polygon([(340, 130), (330, 125), (330, 135)], fill=GRAY)
d.rectangle([190, 240, 230, 258], fill='white')
d.text((198, 242), "SSH", fill=GRAY, font=F)

# === FLECHES ENTRE PODS ===
# Frontend -> Backend
arrow(500, 280, 540, 280, "HTTP")

# Backend -> PostgreSQL  
arrow(690, 280, 730, 280, "SQL")

# === UTILISATEUR (en bas, sous le Frontend) ===
box(350, 420, 150, 45, PURPLE, "UTILISATEUR\nNavigateur web")

# Flèche Utilisateur -> Frontend (simple, verticale, vers le haut)
arrow(425, 420, 425, 355, "http://:30080")

# === LEGENDE ===
d.text((20, 500), "Flux de deploiement:", fill=BLACK, font=FB)
d.text((20, 520), "1. Dev push sur GitLab", fill='#555', font=F)
d.text((20, 537), "2. CI/CD build + push images", fill='#555', font=F)
d.text((20, 554), "3. Ansible SSH vers Master", fill='#555', font=F)
d.text((20, 571), "4. kubectl apply (pull images)", fill='#555', font=F)
d.text((20, 588), "5. User via NodePort 30080", fill='#555', font=F)

d.text((300, 500), "Services:", fill=BLACK, font=FB)
d.rectangle([300, 522, 318, 537], fill=CYAN)
d.text((325, 520), "NodePort = accessible externe", fill='#555', font=F)
d.rectangle([300, 545, 318, 560], fill=GREEN)
d.text((325, 543), "ClusterIP = interne cluster", fill='#555', font=F)

d.text((550, 500), "Communication pods:", fill=BLACK, font=FB)
d.text((550, 520), "User -> Frontend (30080)", fill='#555', font=F)
d.text((550, 537), "Frontend -> Backend (HTTP 5000)", fill='#555', font=F)
d.text((550, 554), "Backend -> PostgreSQL (TCP 5432)", fill='#555', font=F)

img.save('SCHEMA_ARCHITECTURE.png', quality=95)
print("Schema genere: SCHEMA_ARCHITECTURE.png")
