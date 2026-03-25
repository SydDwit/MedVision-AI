import streamlit as st

st.set_page_config(
    page_title="MedVision AI",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.sidebar.image("https://img.icons8.com/color/96/lungs.png", width=80)
st.sidebar.title("MedVision AI")
st.sidebar.caption("Pneumonia Clinical Decision Support System")
st.sidebar.markdown("---")

page = st.sidebar.radio(
    "Navigation",
    [
        "Home",
        "X-Ray Analysis",
        "Risk Prediction",
        "MedBot Chatbot",
        "Model Performance",
    ],
)

st.sidebar.markdown("---")
st.sidebar.caption("Built with FastAPI, Streamlit, and RAG")
st.sidebar.caption("Models: ResNet-50, XGBoost/Random Forest, LLaMA 3")

if page == "Home":
    from page0_home import show
    show()

elif page == "X-Ray Analysis":
    from page1_xray import show
    show()

elif page == "Risk Prediction":
    from page2_risk import show
    show()

elif page == "MedBot Chatbot":
    from page3_chatbot import show
    show()

elif page == "Model Performance":
    from page4_eda import show
    show()