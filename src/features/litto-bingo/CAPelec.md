À 50Htz, le courant change de sens 100 fois par seconde. Donc pour revenir à ma question, ce qu'il se passe 50 fois en une seconde, c'est que le courant revient à son sens d'origine (ex: il était positif et est devenu négatif, puis est revenu positif).

Il me semble que le terme adéquat est "tension efficace". Si on prend la valeur max de la sinusoide, elle sera plus élevée (plus de 300V il me semble). Ces 220v, c'est une sorte de moyenne, un calcul pour simuler un comportement identique qu'en continue. C'est à dire que si on banche un chauffage à 220V réel en continue, et si on branche un chauffage en "220V" (qui n'en sont pas réellement), ces chauffages chaufferont autant l'un que l'autre.on a Ueff = Upic / √2.

Si on touche la phase, notre corps joue le rôle de la terre. On se prend une belle châtaigne, et le différentiel coupe tout. 
Le danger (mortel) c'est si on touche la phase ET le neutre. Le courant passe à travers notre corps de la phase au neutre, ça ne fuit pas vers la terre, donc pas de difference, donc le disjoncteur ne fait rien.

C'est ce que j'évoquais en disant "belle châtaigne". Oui, le courant nous traversé avant le declanchement, ça limite juste la durée. Les 30mA de seuil différentiel domestique ont justement été choisit pour que, si c'était le cas, ça ne soit pas mortel (bon, il y a des cas particuliers, en fonction de l'état de santé, et la présence d'un pacemaker par exemple, mais dans la majorité des cas on s'en sort)

Il y a un disjoncteur de branchement. C'est une protection differentielle générale à 500mA, principalement pour éviter les incendies.
2/ On peut schématiser comme ça :
- Phase : bornier phase → Interrupteur différentiel (ID) → peigne → disjoncteur → (éventuel module de commandement, par exemple pour le chauffe-eau) → prise.
- Neutre : bornier neutre → ID → peigne → disjoncteur → prise.
- Terre : bornier terre → prise (sans passer par l'ID ni le disjoncteur).

Les disjoncteurs présentent deux entrées et deux sorties :  pour la phase ET le neutre.

On met plusieurs ID.Premièrement, ça évite de se retrouver dans le noir et sans eau chaude quand le défaut vient du four. Deuxièmement, ça permet de diagnostiquer plus rapidement d'où vient le problème. Si le disjoncteur de la plaque chauffante sauté, pas besoin de chercher dans la salle de bain.

Le type AC est le type standard, la majorité du circuit y est. Le type A concerne des appareils particulier, qui transforme le courant, et dont les éventuels fuites peuvent être mal captées. Il me semble qu'en gros, c'est la plaque de cuisson, le lave-linge et les bornes de recharge de Véhicule Électrique. Mais beaucoup d'installations, par précaution,  y mettent d'autres choses, comme les VMC/clim/pompe à chaleur, ou les chauffe-eau.

​Sur un tableau, on trouve principalement des interrupteurs différentiels de calibre 40 A ou 63 A. On détermine la valeur à choisir pour une rangée donnée via deux méthodes.
- La méthode en amont est la plus simple. On regarde le calibre du dispositif qui alimente le tableau. Par exemple si on a un disjoncteur de branchement de 45 A, on choisira un ID capable d'encaisser le courant, donc un ID 63A car un 40A serait sous-dimentionné.
- La méthode en aval nécessite de vérifier que L'ID supporte le courant susceptible d'être consommé par les circuits qu'il alimente. Mais attention, il ne s'agit pas d'une simple addition. On additionne les calibres des disjoncteurs en appliquant des coefficients de foisonnement.
La règle classique est :
•100 % des circuits de chauffage électrique, chauffe-eau, recharge VE, etc.
•50 % des autres circuits.
Par exemple, sous un même ID on a :
Plaque de cuisson : 32 A
Prises cuisine : 20 A
Prises séjour : 20 A
Éclairage : 16 A
Four : 20 A
Lave-vaisselle : 20 A
En circuit important on 32 A (plaque).
Tous les autres donnent 20 + 20 + 16 + 20 + 20 = 96 A, mais on ne prend que la moitié : 48A.
Du coup on a 32 + 48 = 80 A.
Il parrait évident qu'un petit ID de 40A ne suffira pas, mais dans cet exemple celui de 63A non plus. Si on le faisait, outre l'endommagement du matériel, il y a un sévère risque d'incendie.
On doit donc dispatcher les prises sur plusieurs ID, afin de respecter la règle de l'aval.

Il existe un composant « monobloc » qui regroupe dans un seul boîtier la protection différentielle 30 mA ET la protection contre les surcharges et courts-circuits.
C'est le disjoncteur différentiel.
2/ Il y a plusieurs cas d'utilisation :
a) Les appareils important nécessitant une continuité de service : congelo, alarme, et parfois système informatique, genre nas ou serveurs. Il y a aussi évidemment tout ce qui est médical, comme les appareils respiratoires. 
b) Tout ce qui est extérieur, parce qu'il y a souvent des faux positif. Portail électrique, arrosage automatique, etc.
c) Ce qui nécessite beaucoup de puissance, clim/pompe à chaleur, et borne de recharge de VE.

La norme NF C 15-100 fixe une association stricte entre la section des conducteurs (e {mm}^2) et le calibre maximal du disjoncteur divisionnaire (en A) pour éviter l'échauffement des fils.
Par exemple :
-Un circuit d'éclairage - 1,5 mm² - 16A - 8 blocs
-Un circuit de prises de courant standard (non spécialisées) - 2,5 mm² - 20A - 12 blocs
-Le circuit dédié à une plaque de cuisson monophasée - 6 mm² - 32A

