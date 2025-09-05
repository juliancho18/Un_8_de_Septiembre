from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    # Puedes cambiar el título dinámicamente si quieres
    return render_template("index.html", titulo="8 de septiembre")

if __name__ == "__main__":
    app.run(debug=True)
