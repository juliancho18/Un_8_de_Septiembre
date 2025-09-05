from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html", titulo="8 de septiembre")

@app.route("/comenzar")
def landing():
    return render_template("landing.html")

@app.route("/que-paso-8-septiembre")
def que_paso():
    return render_template("que_paso.html")

@app.route("/coincidiendo-contigo")
def coincidiendo():
    return render_template("coincidiendo.html")

if __name__ == "__main__":
    app.run(debug=True)
