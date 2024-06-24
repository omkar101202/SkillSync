import React, { useState, useEffect } from 'react';
import { OpenAI } from 'openai';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Body from "./Body";
import axios from 'axios';
import styles from "./Custom.module.css";

function Custom() {
  const [jobDescription, setJobDescription] = useState('');
  const [responseKeywords, setResponseKeywords] = useState('');
  const [responseRecommendations, setResponseRecommendations] = useState('');
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  const openAI = new OpenAI({ apiKey: "USE_YOUR_API_KEY", dangerouslyAllowBrowser: true });

  const getKeywords = async () => {
    try {
      setLoading(true);
      const keywordsPrompt = `
        Generate a concise string containing individual technical keywords as an output which is most relevant to the specified job role specifically as identified by an Applicant Tracking System (ATS), derived directly from the provided job description. Keywords extracted in one to Two atomic words strictly separated by comma with consistent output.
        ${jobDescription}
        Output: Strict format = Skill 1, Skill 2, ....
      `;

      const stream = await openAI.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: keywordsPrompt }],
        stream: true,
      });

      let output = '';

      for await (const chunk of stream) {
        output += chunk.choices[0]?.delta?.content || "";
      }

      setResponseKeywords(output);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    try {
      setLoading(true);
      const recommendationsPrompt = `
        Provide recommendations for skills relevant and generalized tips based on the provided job role and description that are expected in a resume or must present in the resume, following Application Tracking System (ATS) guidelines, as if someone is suggesting them to you. Recommendations should be suggestions for all detailed Skills described in some briefs that ATS would look for in the job role other than already in the job description.
        Job Description:
        ${jobDescription}
      `;

      const stream = await openAI.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: recommendationsPrompt }],
        stream: true,
      });

      let output = '';

      for await (const chunk of stream) {
        output += chunk.choices[0]?.delta?.content || "";
      }

      setResponseRecommendations(output);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUpdatedSkills = async () => {
    try {
      setLoading(true);
      const recommendationsPrompt = `
        Generate an output on string format consisting elements as skills from the user's present skills that most relevant and perfectly fit the provided job description, following Application Tracking System (ATS) guidelines. Skills in output separated by comma and consistent output.
        Job Description:
        ${jobDescription}
        User's Present Skills:
        ${JSON.stringify(userSkills)}
        Output: Strictly in format = Skill 1, Skill 2, Skill3,......
      `;

      const stream = await openAI.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: recommendationsPrompt }],
        stream: true,
      });

      let output = '';

      for await (const chunk of stream) {
        output += chunk.choices[0]?.delta?.content || "";
      }

      setUserSkills(output.split(',').map(skill => skill.trim()));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async () => {
    await getKeywords();
    // await getRecommendations();
    // await getUpdatedSkills();
  };

  const formatKeywords = (keywords) => {
    const keywordArray = keywords.split(',');
    const chunks = [];
    let tempArray = [];
    for (let i = 0; i < keywordArray.length; i++) {
      if (tempArray.length === 3) {
        chunks.push(tempArray);
        tempArray = [];
      }
      tempArray.push(keywordArray[i].trim());
    }
    if (tempArray.length > 0) {
      chunks.push(tempArray);
    }
    return chunks;
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/skills');
        if (response.data && response.data.skills) {
          setUserSkills(response.data.skills);
        }
      } catch (error) { 
        console.error('Error fetching skills:', error);
      }
    };

    fetchSkills();
  }, []);

  return (
    <div className={styles.app}>
      <div>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder='Enter Your Job Description here'
          cols={50}
          rows={10}
        />
      </div>
      <div>
        <button className={styles.btn} onClick={handleSubmit}>Get Started</button>
      </div>
      {loading && <FontAwesomeIcon icon={faSpinner} spin />}
      <div className={styles.responseWindow}>
        <div className={styles.keywords}>
          <div className={styles.title}>Keywords:</div>
          <div className={styles.keywordTable}>
            {formatKeywords(responseKeywords).map((row, index) => (
              <div key={index} className={styles.keywordRow}>
                {row.map((keyword, keyIndex) => (
                  <div key={keyIndex} className={styles.keywordCell}>{keyword}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.recommendations}>
          <div className={styles.title}>Recommendations:</div>
          <div className={styles.recommendationList}>
            {responseRecommendations.split('\n').map((recommendation, index) => (
              <div key={index} className={styles.recommendationItem}>{recommendation}</div>
            ))}
          </div>
        </div>
        <div className={styles.updatedSkills}>
          <div className={styles.title}>Updated Skills:</div>
          <div className={styles.skillList}>
            {userSkills.map((skill, index) => (
              <div key={index}>{skill}</div>
            ))}
          </div>
        </div>
      </div>
      <Body />
    </div>
  );
}

export default Custom;
