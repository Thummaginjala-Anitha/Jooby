import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {AiFillStar} from 'react-icons/ai'
import {MdLocationOn} from 'react-icons/md'
import {BsBriefcaseFill} from 'react-icons/bs'
import Header from '../Header'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class JobItemDetails extends Component {
  state = {
    apiStatus: apiStatusConstants.initial,
    jobDetails: {},
    similarJobs: [],
  }

  componentDidMount() {
    this.getJobDetails()
  }

  getJobDetails = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const {match} = this.props
    const {params} = match
    const {id} = params
    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/jobs/${id}`
    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }
    const response = await fetch(url, options)
    if (response.ok) {
      const data = await response.json()
      const jd = data.job_details
      const jobDetails = {
        companyLogoUrl: jd.company_logo_url,
        companyWebsiteUrl: jd.company_website_url,
        employmentType: jd.employment_type,
        jobDescription: jd.job_description,
        skills: jd.skills.map(skill => ({
          imageUrl: skill.image_url,
          name: skill.name,
        })),
        lifeAtCompany: {
          description: jd.life_at_company.description,
          imageUrl: jd.life_at_company.image_url,
        },
        location: jd.location,
        packagePerAnnum: jd.package_per_annum,
        rating: jd.rating,
        title: jd.title,
        id: jd.id,
      }
      const similarJobs = data.similar_jobs.map(job => ({
        id: job.id,
        companyLogoUrl: job.company_logo_url,
        employmentType: job.employment_type,
        jobDescription: job.job_description,
        location: job.location,
        rating: job.rating,
        title: job.title,
      }))
      this.setState({
        jobDetails,
        similarJobs,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  renderSuccessView = () => {
    const {jobDetails, similarJobs} = this.state
    const {
      companyLogoUrl,
      companyWebsiteUrl,
      employmentType,
      jobDescription,
      skills,
      lifeAtCompany,
      location,
      packagePerAnnum,
      rating,
      title,
    } = jobDetails

    return (
      <div className="job-details-content">
        <div className="job-details-card">
          <div className="job-card-header">
            <img
              src={companyLogoUrl}
              alt="job details company logo"
              className="company-logo"
            />
            <div>
              <h1 className="job-title">{title}</h1>
              <div className="rating-container">
                <AiFillStar className="star-icon" />
                <p className="rating">{rating}</p>
              </div>
            </div>
          </div>
          <div className="job-card-details">
            <div className="location-type-container">
              <div className="location-container">
                <MdLocationOn className="location-icon" />
                <p className="location">{location}</p>
              </div>
              <div className="employment-type-container">
                <BsBriefcaseFill className="briefcase-icon" />
                <p className="employment-type">{employmentType}</p>
              </div>
            </div>
            <p className="package">{packagePerAnnum}</p>
          </div>
          <hr className="separator" />
          <div className="description-header">
            <h1 className="description-heading">Description</h1>
            <a href={companyWebsiteUrl} target="_blank" rel="noreferrer">
              Visit <BsBriefcaseFill />
            </a>
          </div>
          <p className="job-description">{jobDescription}</p>
          <h1 className="skills-heading">Skills</h1>
          <ul className="skills-list">
            {skills.map(skill => (
              <li className="skill-item" key={skill.name}>
                <img src={skill.imageUrl} alt={skill.name} className="skill-image" />
                <p className="skill-name">{skill.name}</p>
              </li>
            ))}
          </ul>
          <h1 className="life-heading">Life at Company</h1>
          <div className="life-at-company">
            <p className="life-description">{lifeAtCompany.description}</p>
            <img
              src={lifeAtCompany.imageUrl}
              alt="life at company"
              className="life-image"
            />
          </div>
        </div>
        <h1 className="similar-jobs-heading">Similar Jobs</h1>
        <ul className="similar-jobs-list">
          {similarJobs.map(job => (
            <li className="similar-job-item" key={job.id}>
              <div className="job-card-header">
                <img
                  src={job.companyLogoUrl}
                  alt="similar job company logo"
                  className="company-logo"
                />
                <div>
                  <h1 className="job-title">{job.title}</h1>
                  <div className="rating-container">
                    <AiFillStar className="star-icon" />
                    <p className="rating">{job.rating}</p>
                  </div>
                </div>
              </div>
              <h1 className="description-heading">Description</h1>
              <p className="job-description">{job.jobDescription}</p>
              <div className="location-type-container">
                <div className="location-container">
                  <MdLocationOn className="location-icon" />
                  <p className="location">{job.location}</p>
                </div>
                <div className="employment-type-container">
                  <BsBriefcaseFill className="briefcase-icon" />
                  <p className="employment-type">{job.employmentType}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  renderFailureView = () => (
    <div className="jobs-failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="failure-image"
      />
      <h1 className="failure-heading">Oops! Something Went Wrong</h1>
      <p className="failure-description">
        We cannot seem to find the page you are looking for
      </p>
      <button type="button" className="retry-button" onClick={this.getJobDetails}>
        Retry
      </button>
    </div>
  )

  renderLoader = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  render() {
    const {apiStatus} = this.state
    return (
      <div className="job-details-bg-container">
        <Header />
        {apiStatus === apiStatusConstants.inProgress && this.renderLoader()}
        {apiStatus === apiStatusConstants.success && this.renderSuccessView()}
        {apiStatus === apiStatusConstants.failure && this.renderFailureView()}
      </div>
    )
  }
}

export default JobItemDetails