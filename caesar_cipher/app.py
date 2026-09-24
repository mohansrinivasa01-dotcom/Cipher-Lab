from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)


def encrypt(text, key):
    result = ""
    for char in text:
        if char.isupper():
            result += chr((ord(char) - ord("A") + key) % 26 + ord("A"))
        elif char.islower():
            result += chr((ord(char) - ord("a") + key) % 26 + ord("a"))
        else:
            result += char
    return result


def decrypt(text, key):
    return encrypt(text, -key)


def game_challenge(level):
    level = max(1, min(int(level), 5))
    rng = random.SystemRandom()
    words = [
        "SECRET", "CIPHER", "ORBIT", "PLANET", "PUZZLE", "SPARK", "LEARN",
        "CODE", "GALAXY", "ROCKET", "HIDDEN", "MISSION", "BRIDGE", "VECTOR",
        "ALPHA", "BRAIN", "QUEST", "SIGNAL", "MATRIX", "SHIELD"
    ]
    phrases = [
        "MEET AT NOON", "OPEN THE DOOR", "LEARN BY DOING", "CODE IS POWER",
        "THE KEY IS FIVE", "WELCOME AGENT", "FIND THE SIGNAL", "KEEP GOING",
        "CRACK THE CODE", "KNOWLEDGE WINS"
    ]
    mode = rng.choice(["decode", "key", "encrypt"])
    key = rng.randint(1, min(25, 4 + level * 2))
    if mode == "decode":
        plain = rng.choice(phrases if level >= 4 else words)
        cipher = encrypt(plain, key)
        options = {key}
        while len(options) < 4:
            options.add(rng.randint(1, 25))
        options = list(options)
        rng.shuffle(options)
        return {
            "mode": mode, "prompt": "Decode the message", "question": f"{cipher}",
            "subtext": f"Decrypt this with the correct shift.", "key": key,
            "answer": decrypt(cipher, key), "options": [decrypt(cipher, k) for k in options],
            "display_options": [f"{decrypt(cipher, k)}  ·  key {k}" for k in options],
            "explanation": f"Shift each letter backward by {key}. {cipher} becomes {decrypt(cipher, key)}."
        }
    if mode == "key":
        plain = rng.choice(phrases if level >= 5 else words)
        cipher = encrypt(plain, key)
        options = {key}
        while len(options) < 4:
            options.add(rng.randint(1, 25))
        options = list(options)
        rng.shuffle(options)
        return {
            "mode": mode, "prompt": "Find the key", "question": f"{plain}  →  {cipher}",
            "subtext": "Which Caesar shift produced the ciphertext?", "key": key,
            "answer": str(key), "options": [str(k) for k in options],
            "display_options": [f"KEY {k:02d}" for k in options],
            "explanation": f"{plain} shifted forward by {key} gives {cipher}."
        }
    plain = rng.choice(phrases if level >= 5 else words)
    cipher = encrypt(plain, key)
    return {
        "mode": mode, "prompt": "Encrypt the message", "question": plain,
        "subtext": f"Type the ciphertext using key {key}.", "key": key,
        "answer": cipher, "options": [], "display_options": [],
        "explanation": f"Shift every letter forward by {key}. The answer is {cipher}."
    }


@app.route("/")
def index():
    return render_template("game.html", active_page="game")

@app.route("/encryption")
def encryption_page():
    return render_template("encryption.html", active_page="encryption")


@app.route("/decryption")
def decryption_page():
    return render_template("decryption.html", active_page="decryption")


@app.route("/bruteforce")
def bruteforce_page():
    return render_template("bruteforce.html", active_page="bruteforce")
    
@app.route("/game")
def game_page():
    return render_template("game.html", active_page="game")





@app.post("/api/encrypt")
def api_encrypt():
    data = request.get_json() or {}
    text = data.get("text", "")
    key = int(data.get("key", 0)) % 26
    return jsonify({"result": encrypt(text, key)})


@app.post("/api/decrypt")
def api_decrypt():
    data = request.get_json() or {}
    text = data.get("text", "")
    key = int(data.get("key", 0)) % 26
    return jsonify({"result": decrypt(text, key)})


@app.post("/api/bruteforce")
def api_bruteforce():
    data = request.get_json() or {}
    text = data.get("text", "")
    results = [{"key": key, "text": decrypt(text, key)} for key in range(26)]
    return jsonify({"results": results})


@app.post("/api/game/challenge")
def api_game_challenge():
    data = request.get_json() or {}
    level = data.get("level", 1)
    return jsonify(game_challenge(level))


@app.post("/api/game/check")
def api_game_check():
    data = request.get_json() or {}
    expected = str(data.get("answer", "")).strip().upper()
    submitted = str(data.get("submitted", "")).strip().upper()
    return jsonify({"correct": expected == submitted})


if __name__ == "__main__":
    app.run(debug=True)
