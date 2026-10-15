import json, datetime as dt, sys
H = """2026-01-01 2026-02-16 2026-02-17 2026-04-03 2026-04-21 2026-05-01 2026-06-04 2026-09-07 2026-10-12 2026-11-02 2026-11-15 2026-11-20 2026-12-25
2027-01-01 2027-02-08 2027-02-09 2027-03-26 2027-04-21 2027-05-01 2027-05-27 2027-09-07 2027-10-12 2027-11-02 2027-11-15 2027-11-20 2027-12-25
2028-01-01 2028-02-28 2028-02-29 2028-04-14 2028-04-21 2028-05-01 2028-06-15 2028-09-07 2028-10-12 2028-11-02 2028-11-15 2028-11-20 2028-12-25""".split()
HS = set(H)
REF = dt.date(2026,10,14)
def bd(a,b):
    n=0; d=a
    while d<b:
        d+=dt.timedelta(days=1)
        if d.weekday()<5 and d.isoformat() not in HS: n+=1
    return n
def add_bd(a,k):
    d=a
    while k>0:
        d+=dt.timedelta(days=1)
        if d.weekday()<5 and d.isoformat() not in HS: k-=1
    return d
def cnpj(b):
    def d(s,w):
        r=sum(int(x)*y for x,y in zip(s,w))%11
        return '0' if r<2 else str(11-r)
    w1=[5,4,3,2,9,8,7,6,5,4,3,2]; w2=[6]+w1
    x=b+d(b,w1); return x+d(x,w2)
def key(n): # 44 digitos deterministicos
    return ('3526101'+str(n).zfill(37))[:44]
H_ = []
def hold(a,ext,deb,face,due,paid=None,inv=True,n=[0]):
    n[0]+=1
    H_.append(dict(assignorId=a,externalId=ext,invoiceKey=key(n[0]) if inv else None,debtorTaxId=deb,faceValue=face,dueDate=due if isinstance(due,str) else due.isoformat(),paidAt=paid))
ALFA='12345678000195'; BETA='11222333000181'
fill_ced=[cnpj(f'{20+i:02d}{i:06d}0001'[:12]) for i in range(1,18)]
fill_sac=[cnpj(f'{60+i:02d}{i*7:06d}0001'[:12]) for i in range(1,51)]
# especificos
hold(ALFA,'DM-2026-0001','66777888000181',30_000_000,add_bd(REF,40))
hold(ALFA,'DM-2026-0002','66777888000181',12_000_000,'2026-09-15',paid='2026-09-15')
hold(fill_ced[0],'DM-2026-1001','55666777000181',150_000_000,add_bd(REF,70))
hold(fill_ced[1],'DM-2026-1002','55666777000262',45_000_000,add_bd(REF,75))
hold(fill_ced[2],'DM-2026-1003','44555666000181',100_000_000,add_bd(REF,72))
hold(fill_ced[3],'DM-2026-1004','22333444000181',5_000_000,'2026-10-04')
hold(fill_ced[3],'DM-2026-1005','33444555000181',8_000_000,'2026-09-24')
# beta: 3.700.000,00 em 4 titulos
for i,v in enumerate([100_000_000,100_000_000,100_000_000,70_000_000]):
    hold(BETA,f'DM-2026-2{i:03d}',fill_sac[i],v,add_bd(REF,[60,80,90,70][i]))
# fillers ate ~35M a vencer
def open_due():
    return [h for h in H_ if h['paidAt'] is None and h['dueDate']>=REF.isoformat()]
target=3_500_000_000
k=0; terms=[45,60,75,90,95,70,80,65,80,90]
ced_exp={}
while sum(h['faceValue'] for h in open_due()) < target-45_000_000:
    c=fill_ced[4+(k%12)]; s=fill_sac[4+(k%45)]
    v=[40_000_000,55_000_000,35_000_000,50_000_000][k%4]
    hold(c,f'DM-2026-3{k:03d}',s,v,add_bd(REF,terms[k%len(terms)])); k+=1
# ajuste final para fechar WAT ~74
def wat():
    o=open_due(); return sum(h['faceValue']*bd(REF,dt.date.fromisoformat(h['dueDate'])) for h in o)/sum(h['faceValue'] for h in o)
rem=target-sum(h['faceValue'] for h in open_due())
best=None
for t in range(20,200):
    hold(fill_ced[16],'DM-2026-9999',fill_sac[49],rem,add_bd(REF,t))
    w=wat()
    if best is None or abs(w-74)<abs(best[1]-74): best=(t,w)
    H_.pop()
hold(fill_ced[16],'DM-2026-9999',fill_sac[49],rem,add_bd(REF,best[0]))
# checks
from collections import defaultdict
ce=defaultdict(int); se=defaultdict(int)
for h in H_:
    if h['paidAt'] is None:
        ce[h['assignorId']]+=h['faceValue']; se[h['debtorTaxId'][:8]]+=h['faceValue']
print('total a vencer',sum(h['faceValue'] for h in open_due()),'WAT',round(wat(),3),'n',len(H_),file=sys.stderr)
print('max ced',max(ce.values()),'beta',ce[BETA],'alfa',ce[ALFA],file=sys.stderr)
print('max sac',max(v for g,v in se.items()),'556667',se['55666777'],file=sys.stderr)
print('limits ok', all(v<=375_000_000 for v in ce.values()), all(v<=200_000_000 for v in se.values()),file=sys.stderr)
assignors=[dict(id=ALFA,name='Alfa Distribuidora de Alimentos Ltda',status='ACTIVE'),
 dict(id=BETA,name='Beta Industria Metalurgica SA',status='ACTIVE'),
 dict(id='98765432000198',name='Gama Comercio de Embalagens Ltda',status='SUSPENDED'),
 dict(id='77888999000181',name='Delta Servicos Logisticos Ltda',status='UNDER_REVIEW')]+[dict(id=c,name=f'Cedente Carteira {i+1:02d} Ltda',status='ACTIVE') for i,c in enumerate(fill_ced)]
json.dump(dict(assignors=assignors,holdings=H_),open(sys.argv[1],'w'),indent=2,ensure_ascii=False)
