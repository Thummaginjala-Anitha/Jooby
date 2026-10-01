import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {BsSearch} from 'react-icons/bs'
import Header from '../Header'
import JobCard from '../JobCard'
import './index.css'

const employmentTypesList = [
  {label: 'Full Time', employmentTypeId: 'FULLTIME'},
  {label: 'Part Time', employmentTypeId: 'PARTTIME'},
  {label: 'Freelance', employmentTypeId: 'FREELANCE'},
  {label: 'Internship', employmentTypeId: 'INTERNSHIP'},
]

const salaryRangesList = [
  {salaryRangeId: '1000000', label: '10 LPA and above'},
  {salaryRangeId: '2000000', label: '20 LPA and above'},
  {salaryRangeId: '3000000', label: '30 LPA and above'},
  {salaryRangeId: '4000000', label: '40 LPA and above'},
]

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Jobs extends Component {
  state = {
    profileApiStatus: apiStatusConstants.initial,
    profileDetails: {},
    jobsApiStatus: apiStatusConstants.initial,
    jobsList: [],
    searchInput: '',
    employmentType: [],
    minimumPackage: '',
  }

  componentDidMount() {
    this.getProfileDetails()
    this.getJobs()
  }

  getProfileDetails = async () => {
    this.setState({profileApiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const url = 'https://apis.ccbp.in/profile'
    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }
    const response = await fetch(url, options)
    if (response.ok) {
      const data = await response.json()
      const profileDetails = {
        name: data.profile_details.name,
        profileImageUrl: data.profile_details.profile_image_url,
        shortBio: data.profile_details.short_bio,
      }
      this.setState({
        profileDetails,
        profileApiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({profileApiStatus: apiStatusConstants.failure})
    }
  }

  getJobs = async () => {
    this.setState({jobsApiStatus: apiStatusConstants.inProgress})
    const {employmentType, minimumPackage, searchInput} = this.state
    const jwtToken = Cookies.get('jwt_token')
    const employmentTypeParam = employmentType.join(',')
    const url = `https://apis.ccbp.in/jobs?employment_type=${employmentTypeParam}&minimum_package=${minimumPackage}&search=${searchInput}`
    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }
    const response = await fetch(url, options)
    if (response.ok) {
      const data = await response.json()
      const jobsList = data.jobs.map(job => ({
        id: job.id,
        companyLogoUrl: job.company_logo_url,
        employmentType: job.employment_type,
        jobDescription: job.job_description,
        location: job.location,
        packagePerAnnum: job.package_per_annum,
        rating: job.rating,
        title: job.title,
      }))
      this.setState({jobsList, jobsApiStatus: apiStatusConstants.success})
    } else {
      this.setState({jobsApiStatus: apiStatusConstants.failure})
    }
  }

  onChangeSearchInput = e => this.setState({searchInput: e.target.value})

  onClickSearch = () => this.getJobs()

  onChangeEmploymentType = event => {
    const {value, checked} = event.target
    this.setState(prevState => {
      const updated = checked
        ? [...prevState.employmentType, value]
        : prevState.employmentType.filter(item => item !== value)
      return {employmentType: updated}
    }, this.getJobs)
  }

  onChangeSalaryRange = event => {
    this.setState({minimumPackage: event.target.value}, this.getJobs)
  }

  renderProfile = () => {
    const {profileApiStatus, profileDetails} = this.state
    if (profileApiStatus === apiStatusConstants.inProgress) {
      return (
        <div className="loader-container" data-testid="loader">
          <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
        </div>
      )
    }
    if (profileApiStatus === apiStatusConstants.success) {
      const {name, profileImageUrl, shortBio} = profileDetails
      return (
        <div className="profile-container">
          <img src={profileImageUrl} alt="profile" className="profile-image" />
          <h1 className="profile-name">{name}</h1>
          <p className="profile-bio">{shortBio}</p>
        </div>
      )
    }
    if (profileApiStatus === apiStatusConstants.failure) {
      return (
        <div className="profile-failure-container">
          <button
            type="button"
            className="retry-button"
            onClick={this.getProfileDetails}
          >
            Retry
          </button>
        </div>
      )
    }
    return null
  }

  renderJobsList = () => {
    const {jobsList} = this.state
    if (jobsList.length === 0) {
      return (
        <div className="no-jobs-container">
          <img
            src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
            alt="no jobs"
            className="no-jobs-image"
          />
          <h1 className="no-jobs-heading">No Jobs Found</h1>
          <p className="no-jobs-description">
            We could not find any jobs. Try other filters
          </p>
        </div>
      )
    }
    return (
      <ul className="jobs-list">
        {jobsList.map(job => (
          <JobCard jobDetails={job} key={job.id} />
        ))}
      </ul>
    )
  }

  renderJobsStatus = () => {
    const {jobsApiStatus} = this.state
    switch (jobsApiStatus) {
      case apiStatusConstants.inProgress:
        return (
          <div className="loader-container" data-testid="loader">
            <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
          </div>
        )
      case apiStatusConstants.success:
        return this.renderJobsList()
      case apiStatusConstants.failure:
        return (
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
            <button
              type="button"
              className="retry-button"
              onClick={this.getJobs}
            >
              Retry
            </button>
          </div>
        )
      default:
        return null
    }
  }

  render() {
    const {searchInput} = this.state
    return (
      <div className="jobs-bg-container">
        <Header />
        <div className="jobs-content-container">
          <div className="filters-container">
            {this.renderProfile()}
            <hr className="separator" />
            <h1 className="filter-heading">Type of Employment</h1>
            <ul className="filter-list">
              {employmentTypesList.map(item => (
                <li className="filter-item" key={item.employmentTypeId}>
                  <input
                    type="checkbox"
                    id={item.employmentTypeId}
                    value={item.employmentTypeId}
                    onChange={this.onChangeEmploymentType}
                  />
                  <label htmlFor={item.employmentTypeId}>{item.label}</label>
                </li>
              ))}
            </ul>
            <hr className="separator" />
            <h1 className="filter-heading">Salary Range</h1>
            <ul className="filter-list">
              {salaryRangesList.map(item => (
                <li className="filter-item" key={item.salaryRangeId}>
                  <input
                    type="radio"
                    id={item.salaryRangeId}
                    name="salary"
                    value={item.salaryRangeId}
                    onChange={this.onChangeSalaryRange}
                  />
                  <label htmlFor={item.salaryRangeId}>{item.label}</label>
                </li>
              ))}
            </ul>
          </div>
          <div className="jobs-section">
            <div className="search-container">
              <input
                type="search"
                className="search-input"
                placeholder="Search"
                value={searchInput}
                onChange={this.onChangeSearchInput}
              />
              <button
                type="button"
                data-testid="searchButton"
                className="search-button"
                onClick={this.onClickSearch}
              >
                <BsSearch className="search-icon" />
              </button>
            </div>
            {this.renderJobsStatus()}
          </div>
        </div>
      </div>
    )
  }
}

export default Jobs
