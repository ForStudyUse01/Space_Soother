
# 2D Space Shooter (Web Version)

A modern, feature-rich 2D Space Shooter game playable in your web browser!
 
## Features
- **Player spaceship**: Move left/right, shoot bullets, collect perks.
- **Enemies**: Descend from the top, some can shoot at you, all die in one hit.
- **Enemy health bar**: All enemies have 1 health (die in one bullet).
- **Enemy shooters**: Only some enemies can shoot (cyan gun under sprite).
- **Bullets and grenades**: Limited ammo, collect grenades and use them to destroy multiple enemies.
- **Perks**: Health, ammo, speed boost, rapid fire, and grenades.
- **Health bar**: Player health displayed at the top left.
- **Score**: Increases as you destroy enemies.
- **Game Over screen**: Restart or quit.
- **Particle effects**: For shooting, explosions, and grenades.

## Controls
- **Left/Right Arrow**: Move spaceship
- **Spacebar**: Shoot
- **G**: Throw grenade (if available)
- **R**: Restart (on Game Over screen)
- **Q**: Quit (on Game Over screen)

## How to Run
1. Open a terminal and navigate to the `web` directory:
   ```
   cd web
   ```
2. Start a local server (Python 3):
   ```
   python -m http.server 8000
   ```
3. Open your browser and go to [http://localhost:8000](http://localhost:8000)
4. Play the game!

Alternatively, you can open `index.html` directly in your browser, but some features (like sound, if added) may require a local server.

## Credits
- Game and code: Yuvraj Gandhi & Yooraj Gole
- Built with **HTML5 Canvas** and **JavaScript**

---
Enjoy blasting enemies and collecting perks! Feel free to modify or expand the game. 
