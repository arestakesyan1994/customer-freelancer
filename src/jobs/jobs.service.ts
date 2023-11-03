import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobSkillService } from 'src/job-skill/job-skill.service';
import { UserSkillsService } from 'src/user-skills/user-skills.service';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './entities/job.entity';
import { StatusEnum } from './status/status.enum';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private jobRepository: Repository<Job>,
    private readonly jobSkillsService: JobSkillService,
  ) { }

  async create(createJobDto: any) {
    const {skills, ...data} = createJobDto
    const job = await this.jobRepository.save({ ...data, status: StatusEnum.START })
    console.log(job);    
    if(skills && skills.length){
      for(let e of skills){
        await this.jobSkillsService.create({jobId:job.id, skillId:e})
      }
    }
    return 'adds a new job';
  }

  async findAll() {
    return this.jobRepository.find();
  }

  async findOne(id: number) {
    const job = await this.jobRepository.findOne({
      where: {
        id: id
      },
      relations: {
        jobSkills: true
      }
    })
    if (!job) {
      throw new NotFoundException("Oops! job not fount")
    } else {
      return job
    }
  }
  async findJobsByCustomerId(id: number) {
    const job = await this.jobRepository.find({
      where: {
        customerId: id
      },
      relations: [  "jobSkills", "jobSkills.skill", 'freelancer']
    })
    if (!job) {
      throw new NotFoundException("Oops! job not fount")
    } else {
      return job
    }
  }
  async findJobsByFreelancerId(id: number) {
    const job = await this.jobRepository.find({
      where: {
        freelancerId: id
      },
      relations: [  "jobSkills", "jobSkills.skill", 'customer']
    })
    if (!job) {
      throw new NotFoundException("Oops! job not fount")
    } else {
      return job
    }
  }
  async findJobsByStatus(status: number) {
    const job = await this.jobRepository.find({
      where: {
        status
      },
      relations: {
        jobSkills: true
      }
    })
    if (!job) {
      throw new NotFoundException("Oops! job not fount")
    } else {
      return job
    }
    
  }

  async update(id: number, updateJobDto: UpdateJobDto) {
    const job = await this.jobRepository.findOne({
      where: {
        id: id
      }
    })
    if (job) {
      await this.jobRepository.update({ id }, updateJobDto);
      return `Updated job - ${job.title}`;
    } else {
      return new NotFoundException('Oops! job not found');
    }
  }
  async updateJobStatus(id: number,{num} : {num:number}) {
    const job = await this.jobRepository.findOne({
      where: {
        id: id
      }
    })
    if (job) {
      if(num==0 || num==1 ||num==2){
        await this.jobRepository.update({ id }, {status:num});
        return `Updated job - ${job.title}`;
      }else{
        throw new NotFoundException('Oops! status value invalid');
      }
    } else {
      throw new NotFoundException('Oops! job not found');
    }
  }

  async remove(id: number) {
    const job = await this.jobRepository.findOneBy({ id });
    if (job) {
      this.jobRepository.delete({ id })
      return "delete job - " + job.title;
    } else {
      throw new NotFoundException('Oops! job not found');
    }
  }
}
