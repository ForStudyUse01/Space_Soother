import pygame
import random
import sys

# Initialize Pygame
pygame.init()

# Screen dimensions
WIDTH, HEIGHT = 480, 640
SCREEN = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("2D Space Shooter")

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
YELLOW = (255, 255, 0)

# Game settings
FPS = 60
PLAYER_SPEED = 5
BULLET_SPEED = 7
ENEMY_SPEED = 2
ENEMY_SPAWN_RATE = 30  # frames

# Sound placeholders (add your own .wav files if desired)
BACKGROUND_MUSIC = None  # 'background_music.wav'
SHOOT_SOUND = None  # 'shoot.wav'
EXPLOSION_SOUND = None  # 'explosion.wav'

# Load sounds (if files exist)
def load_sound(path):
    try:
        return pygame.mixer.Sound(path)
    except:
        return None

if BACKGROUND_MUSIC:
    pygame.mixer.music.load(BACKGROUND_MUSIC)
    pygame.mixer.music.play(-1)
shoot_sound = load_sound(SHOOT_SOUND)
explosion_sound = load_sound(EXPLOSION_SOUND)

# Fonts
FONT = pygame.font.SysFont("Arial", 24)
BIG_FONT = pygame.font.SysFont("Arial", 48)

# Player class
class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((50, 30))
        self.image.fill(BLUE)
        self.rect = self.image.get_rect()
        self.rect.centerx = WIDTH // 2
        self.rect.bottom = HEIGHT - 10
        self.speed = PLAYER_SPEED

    def update(self, keys):
        if keys[pygame.K_LEFT] and self.rect.left > 0:
            self.rect.x -= self.speed
        if keys[pygame.K_RIGHT] and self.rect.right < WIDTH:
            self.rect.x += self.speed

    def shoot(self, bullets_group):
        bullet = Bullet(self.rect.centerx, self.rect.top)
        bullets_group.add(bullet)
        if shoot_sound:
            shoot_sound.play()

# Bullet class
class Bullet(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((5, 15))
        self.image.fill(YELLOW)
        self.rect = self.image.get_rect()
        self.rect.centerx = x
        self.rect.bottom = y
        self.speed = BULLET_SPEED

    def update(self):
        self.rect.y -= self.speed
        if self.rect.bottom < 0:
            self.kill()

# Enemy class
class Enemy(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((40, 30))
        self.image.fill(RED)
        self.rect = self.image.get_rect()
        self.rect.x = random.randint(0, WIDTH - self.rect.width)
        self.rect.y = random.randint(-100, -40)
        self.speed = ENEMY_SPEED

    def update(self):
        self.rect.y += self.speed
        if self.rect.top > HEIGHT:
            self.kill()

# Draw text on the screen
def draw_text(surface, text, font, color, x, y, center=True):
    img = font.render(text, True, color)
    rect = img.get_rect()
    if center:
        rect.center = (x, y)
    else:
        rect.topleft = (x, y)
    surface.blit(img, rect)

# Game Over screen
def game_over_screen(score):
    SCREEN.fill(BLACK)
    draw_text(SCREEN, "GAME OVER", BIG_FONT, WHITE, WIDTH // 2, HEIGHT // 2 - 50)
    draw_text(SCREEN, f"Score: {score}", FONT, WHITE, WIDTH // 2, HEIGHT // 2)
    draw_text(SCREEN, "Press R to Restart or Q to Quit", FONT, WHITE, WIDTH // 2, HEIGHT // 2 + 50)
    pygame.display.flip()
    waiting = True
    while waiting:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r:
                    waiting = False
                if event.key == pygame.K_q:
                    pygame.quit()
                    sys.exit()

# Main game function
def main():
    clock = pygame.time.Clock()
    running = True
    score = 0
    enemy_timer = 0

    # Sprite groups
    player = Player()
    player_group = pygame.sprite.Group(player)
    bullets_group = pygame.sprite.Group()
    enemies_group = pygame.sprite.Group()

    while running:
        clock.tick(FPS)
        keys = pygame.key.get_pressed()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    player.shoot(bullets_group)

        # Update
        player.update(keys)
        bullets_group.update()
        enemies_group.update()

        # Spawn enemies
        enemy_timer += 1
        if enemy_timer >= ENEMY_SPAWN_RATE:
            enemy = Enemy()
            enemies_group.add(enemy)
            enemy_timer = 0

        # Bullet-enemy collisions
        hits = pygame.sprite.groupcollide(enemies_group, bullets_group, True, True)
        if hits:
            score += len(hits)
            if explosion_sound:
                explosion_sound.play()

        # Enemy-player collisions
        if pygame.sprite.spritecollideany(player, enemies_group):
            running = False

        # Enemy reaches bottom
        for enemy in enemies_group:
            if enemy.rect.bottom >= HEIGHT:
                running = False

        # Draw
        SCREEN.fill(BLACK)
        player_group.draw(SCREEN)
        bullets_group.draw(SCREEN)
        enemies_group.draw(SCREEN)
        draw_text(SCREEN, f"Score: {score}", FONT, WHITE, 10, 10, center=False)
        pygame.display.flip()

    # Game Over
    game_over_screen(score)
    main()  # Restart game

if __name__ == "__main__":
    main() 