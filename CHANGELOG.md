# Változások

## 2025-01-20 - Bug fixes és UI fejlesztések

### Hibajavítások 🐛
- **Konfetti trigger javítás**: A konfetti most már csak akkor jelenik meg, amikor mindkét fél ugyanarra a névre nyom "Tetszik"-et (mutual match). Korábban rossz logika miatt túl gyakran aktiválódott.
- **Button styling**: Javítva a button CSS osztálynevek (.btn → .button) hogy megfelelően jelenjenek meg a gombok gradient háttérrel.

### Új funkciók ✨
- **Intelligens név szűrés**: A backend mostantól kiszűri azokat a neveket, amelyeket bármelyik résztvevő már elutasított ("Nem"). Így nem pazaroljátok az időt olyan nevekre, amiket a párod már nem szeretne.

### UI/UX fejlesztések 🎨
- **Session top bar átdolgozása**: Grid layout a jobb elrendezésért, bal oldalon a meghívó + filterek, jobb oldalon a gombok
- **Filter card styling**: A "Preferált nem" szekció most Card komponensben van, ugyanolyan stílussal mint a többi kártya
- **Tab aktív állapot**: Világosan látszik melyik tab van kiválasztva (gradient háttér + árnyék a "Szavazás", "Fiú", "Lány", "Mindegy" stb. gombokon)
- **Sötét mód támogatás**: Theme toggle gomb hozzáadva
- **Toast értesítések**: Vizuális visszajelzés a kedvenc hozzáadásakor
- **Konfetti animáció**: Ünneplés mutual match esetén

### Technikai változások 🔧
- Új komponensek: `ThemeToggle`, `ToastNotification`, `Confetti`, `SearchBar`
- Új hooks: `useTheme`, `useToast`, `useSwipeGesture`
- Dark mode CSS változók hozzáadva
- SearchBar a mutual és top listákhoz

### Tesztelés ✅
- Manuális teszt végezve két résztvevővel
- Név szűrés működés ellenőrizve
- UI javítások vizuálisan tesztelve
