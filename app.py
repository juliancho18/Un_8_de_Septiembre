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
    return "<h1 style='font-family: system-ui; text-align:center; margin-top:3rem;'>Timeline en construcción…</h1>"

@app.route("/coincidiendo-contigo")
def coincidiendo():
    return "<h1 style='font-family: system-ui; text-align:center; margin-top:3rem;'>Coincidiendo contigo — próximamente</h1>"

if __name__ == "__main__":
    app.run(debug=True)
