import React, { useState, useEffect } from 'react';
import Btn from '../components/Btn';
import Fld from '../components/Fld';
import Chip from '../components/Chip';
import { profileAPI } from '../utils/api';
import { calculateAllMetrics } from '../utils/math';

const ProfileScreen = ({ currentUser, onComplete, onGoToChat, addToast }) => {
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    email: currentUser?.email || '',
    location: '',
    age: '',
    height: '',
    weight: '',
    sex: 'Male',
    goal: '',
    activityLevel: '',
    dietPreference: '',
    healthConditions: [],
    allergies: []
  });

  const [metrics, setMetrics] = useState(null);

  // Live health calculations
  const bmi = (profile.height && profile.weight)
    ? +(+profile.weight / ((+profile.height / 100) ** 2)).toFixed(1)
    : null;

  const bmr = (profile.height && profile.weight && profile.age)
    ? (profile.sex === "Male"
        ? +(10 * +profile.weight + 6.25 * +profile.height - 5 * +profile.age + 5).toFixed(0)
        : +(10 * +profile.weight + 6.25 * +profile.height - 5 * +profile.age - 161).toFixed(0))
    : null;

  const tdee = bmr
    ? Math.round(bmr * {
        "Sedentary": 1.2,
        "Lightly Active": 1.375,
        "Moderately Active": 1.55,
        "Very Active": 1.725,
        "Athlete": 1.9
      }[profile.activityLevel || "Sedentary"])
    : null;

  const bmiLabel = b =>
    b < 18.5 ? "Underweight" :
    b < 25   ? "Normal" :
    b < 30   ? "Overweight" : "Obese";

  const bmiColor = b =>
    b < 18.5 ? "#60a5fa" :
    b < 25   ? "#4ade80" :
    b < 30   ? "#fbbf24" : "#f87171";

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileAPI.get();
        if (data.profile) {
          setProfile(prev => ({ ...prev, ...data.profile }));
        }
      } catch {
        // Profile not found - user needs to create one
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const { age, height, weight, sex, activityLevel, goal } = profile;
    if (age && height && weight && sex && activityLevel && goal) {
      const m = calculateAllMetrics({ age, height, weight, sex, activityLevel, goal });
      setMetrics(m);
    } else {
      setMetrics(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.age, profile.height, profile.weight, profile.sex, profile.activityLevel, profile.goal]);

  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field, value) => {
    setProfile(prev => {
      const arr = prev[field];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(v => v !== value) };
      }
      return { ...prev, [field]: [...arr, value] };
    });
  };

  const isValid = () => {
    return profile.fullName && profile.phone && profile.age && profile.height && profile.weight;
  };

  const handleSave = async () => {
    if (!isValid()) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    try {
      await profileAPI.save(profile);
      addToast('Profile saved! 🌿', 'success');
      onComplete();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const fitnessGoals = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Endurance', 'Heart Health', 'Diabetes Management'];
  const activityLevels = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Athlete'];
  const dietPreferences = ['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Eggetarian', 'Keto', 'Paleo', 'Mediterranean'];
  const healthConditions = ['None', 'Diabetes', 'Hypertension', 'PCOS', 'Thyroid', 'Heart Disease', 'Kidney Disease', 'Celiac', 'IBS', 'Anemia'];
  const allergies = ['None', 'Gluten', 'Dairy', 'Nuts', 'Eggs', 'Soy', 'Shellfish', 'Fish', 'Wheat', 'Sesame'];

  const cardStyle = {
    background: '#111e2e',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    border: '1px solid #1a3350'
  };

  const sectionTitleStyle = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#dde6f0',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const chipGridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      background: '#070d17'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4ade80 0%, #0ea5e9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          fontSize: '28px'
        }}>
          🌿
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#dde6f0', margin: '0 0 4px' }}>
          Complete Your Profile
        </h1>
        <p style={{ fontSize: '13px', color: '#4a6280', margin: 0 }}>
          Help us personalize your nutrition journey
        </p>
      </div>

      {/* Contact Details */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>👤 Contact Details</div>
        <div style={{ marginBottom: '12px' }}>
          <Fld
            label="Full Name *"
            value={profile.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <Fld
            label="Phone *"
            value={profile.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="Your phone number"
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <Fld
            label="Email"
            value={profile.email}
            readOnly
            placeholder="Your email"
          />
        </div>
        <div>
          <Fld
            label="Location"
            value={profile.location}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="City, State, Country"
          />
        </div>
      </div>

      {/* Body Metrics */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>📊 Body Metrics</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <Fld
            label="Age *"
            type="number"
            value={profile.age}
            onChange={(e) => updateField('age', e.target.value)}
            placeholder="Years"
          />
          <Fld
            label="Height *"
            type="number"
            value={profile.height}
            onChange={(e) => updateField('height', e.target.value)}
            placeholder="cm"
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <Fld
            label="Weight *"
            type="number"
            value={profile.weight}
            onChange={(e) => updateField('weight', e.target.value)}
            placeholder="kg"
          />
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#dde6f0', marginBottom: '6px', display: 'block' }}>
              Biological Sex *
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Male', 'Female'].map(s => (
                <button
                  key={s}
                  onClick={() => updateField('sex', s)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: `1px solid ${profile.sex === s ? '#4ade80' : '#1a3350'}`,
                    background: profile.sex === s ? '#4ade80' : '#0d1520',
                    color: profile.sex === s ? '#070d17' : '#dde6f0',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Metrics */}
        {metrics && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginTop: '16px',
            padding: '16px',
            background: '#0d1520',
            borderRadius: '12px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: metrics.bmiCategory.color }}>
                {metrics.bmi}
              </div>
              <div style={{ fontSize: '12px', color: '#4a6280' }}>BMI ({metrics.bmiCategory.label})</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#4ade80' }}>
                {metrics.bmr}
              </div>
              <div style={{ fontSize: '12px', color: '#4a6280' }}>BMR (kcal)</div>
            </div>
          </div>
        )}

        {/* Live Health Calculations Card */}
        {bmi && (
          <div style={{
            background: "#0d1520",
            borderRadius: 14,
            border: "1.5px solid #1a3350",
            padding: 16,
            marginTop: 12,
            marginBottom: 14,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 800, color: "#0ea5e9",
              textTransform: "uppercase", letterSpacing: 1, marginBottom: 12,
            }}>
              📊 Live Health Calculations
            </div>

            {/* Three metric cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[
                ["⚖️ BMI",  bmi,        bmiLabel(bmi), bmiColor(bmi)],
                ["🔥 BMR",  `${bmr}`,   "kcal / day",  "#0ea5e9"],
                ["⚡ TDEE", `${tdee}`,  "kcal / day",  "#4ade80"],
              ].map(([title, value, sub, color]) => (
                <div key={title} style={{
                  background: "#070d17",
                  borderRadius: 10,
                  padding: "10px 8px",
                  border: `1.5px solid ${color}33`,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 8, color: "#4a6280", fontWeight: 800,
                                textTransform: "uppercase", marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: color,
                                lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 9, color: sub === bmiLabel(bmi) ? color : "#4a6280",
                                marginTop: 3, fontWeight: 700 }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* BMI scale bar */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                            fontSize: 8, color: "#4a6280", marginBottom: 4 }}>
                <span>0</span><span>18.5</span><span>25</span><span>30</span><span>40+</span>
              </div>
              <div style={{ position: "relative", height: 10, borderRadius: 8,
                            background: "linear-gradient(90deg,#60a5fa 0%,#4ade80 37%,#fbbf24 62%,#f87171 100%)",
                            overflow: "hidden" }}>
                {/* marker */}
                <div style={{
                  position: "absolute",
                  left: `${Math.min((bmi / 40) * 100, 100)}%`,
                  top: 0, bottom: 0,
                  width: 3, background: "#fff",
                  borderRadius: 2,
                  transform: "translateX(-50%)",
                  boxShadow: "0 0 6px #fff",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between",
                            fontSize: 7, color: "#4a6280", marginTop: 3 }}>
                <span style={{ color: "#60a5fa" }}>Underweight</span>
                <span style={{ color: "#4ade80" }}>Normal</span>
                <span style={{ color: "#fbbf24" }}>Overweight</span>
                <span style={{ color: "#f87171" }}>Obese</span>
              </div>
            </div>

            {/* Info notes */}
            {[
              "BMI is calculated from your height and weight.",
              "BMR = calories your body burns completely at rest.",
              `TDEE = BMR × ${{"Sedentary":1.2,"Lightly Active":1.375,"Moderately Active":1.55,"Very Active":1.725,"Athlete":1.9}[profile.activityLevel || "Sedentary"]} activity multiplier`,
            ].map((note, i) => (
              <div key={i} style={{ fontSize: 9, color: "#4a6280", marginBottom: 3,
                                     display: "flex", gap: 5 }}>
                <span style={{ color: "#0ea5e9" }}>ℹ️</span>{note}
              </div>
            ))}
          </div>
        )}

        {/* Hint when fields are empty */}
        {(!profile.height || !profile.weight) && (
          <div style={{
            padding: "10px 14px", borderRadius: 10, marginTop: 10,
            background: "#0ea5e908", border: "1px dashed #1a3350",
            color: "#4a6280", fontSize: 11, textAlign: "center",
          }}>
            Enter height and weight above to see your BMI, BMR and TDEE
          </div>
        )}
      </div>

      {/* Goal & Diet */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>🎯 Goal & Activity</div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: '#4a6280', marginBottom: '8px', display: 'block' }}>
            Fitness Goal
          </label>
          <div style={chipGridStyle}>
            {fitnessGoals.map(goal => (
              <Chip
                key={goal}
                active={profile.goal === goal}
                onClick={() => updateField('goal', goal)}
                color="#f59e0b"
              >
                {goal}
              </Chip>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: '#4a6280', marginBottom: '8px', display: 'block' }}>
            Activity Level
          </label>
          <div style={chipGridStyle}>
            {activityLevels.map(level => (
              <Chip
                key={level}
                active={profile.activityLevel === level}
                onClick={() => updateField('activityLevel', level)}
                color="#0ea5e9"
              >
                {level}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 500, color: '#4a6280', marginBottom: '8px', display: 'block' }}>
            Diet Preference
          </label>
          <div style={chipGridStyle}>
            {dietPreferences.map(diet => (
              <Chip
                key={diet}
                active={profile.dietPreference === diet}
                onClick={() => updateField('dietPreference', diet)}
                color="#4ade80"
              >
                {diet}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {/* Health & Allergies */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>🏥 Health & Allergies</div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: '#4a6280', marginBottom: '8px', display: 'block' }}>
            Health Conditions
          </label>
          <div style={chipGridStyle}>
            {healthConditions.map(condition => (
              <Chip
                key={condition}
                active={profile.healthConditions.includes(condition)}
                onClick={() => toggleArrayField('healthConditions', condition)}
                color="#f59e0b"
              >
                {condition}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 500, color: '#4a6280', marginBottom: '8px', display: 'block' }}>
            Allergies
          </label>
          <div style={chipGridStyle}>
            {allergies.map(allergy => (
              <Chip
                key={allergy}
                active={profile.allergies.includes(allergy)}
                onClick={() => toggleArrayField('allergies', allergy)}
                color="#f87171"
              >
                {allergy}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ padding: '8px 0 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Btn
          variant="primary"
          size="lg"
          disabled={!isValid()}
          onClick={handleSave}
          style={{ width: '100%' }}
        >
          Save Profile & Continue →
        </Btn>
        {metrics && (
          <Btn
            variant="ghost"
            size="lg"
            onClick={onGoToChat}
            style={{ width: '100%' }}
          >
            💬 Go to Chat/Analysis
          </Btn>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;
