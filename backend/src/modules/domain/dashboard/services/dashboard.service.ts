import { PressReleaseRepository } from '../../press-releases/repositories/press-release.repository';
import { MediaContactRepository } from '../../media-contacts/repositories/media-contact.repository';
import { ClippingRepository } from '../../clippings/repositories/clipping.repository';
import { EventRepository } from '../../events/repositories/event.repository';
import { AppointmentRepository } from '../../appointments/repositories/appointment.repository';
import { CitizenPortalRepository } from '../../citizen-portal/repositories/citizen-portal.repository';
import { SocialMediaRepository } from '../../social-media/repositories/social-media.repository';

export class DashboardService {
  private pressReleases: PressReleaseRepository;
  private mediaContacts: MediaContactRepository;
  private clippings: ClippingRepository;
  private events: EventRepository;
  private appointments: AppointmentRepository;
  private citizens: CitizenPortalRepository;
  private socialMedia: SocialMediaRepository;

  constructor() {
    this.pressReleases = new PressReleaseRepository();
    this.mediaContacts = new MediaContactRepository();
    this.clippings = new ClippingRepository();
    this.events = new EventRepository();
    this.appointments = new AppointmentRepository();
    this.citizens = new CitizenPortalRepository();
    this.socialMedia = new SocialMediaRepository();
  }

  async getSummary() {
    const [
      pressReleasesCount,
      mediaContactsCount,
      clippingsCount,
      eventsCount,
      appointmentsCount,
      citizensCount,
      socialMediaCount,
      recentPressReleases,
      upcomingEvents,
      pendingAppointments,
    ] = await Promise.all([
      this.pressReleases.count({ isDeleted: false } as any),
      this.mediaContacts.count({ isDeleted: false } as any),
      this.clippings.count({ isDeleted: false } as any),
      this.events.count({ isDeleted: false } as any),
      this.appointments.count({ isDeleted: false } as any),
      this.citizens.count({ isDeleted: false } as any),
      this.socialMedia.count({ isDeleted: false } as any),
      this.pressReleases.findRecent(5),
      this.events.findUpcoming(5),
      this.appointments.countPending(),
    ]);

    return {
      counts: {
        pressReleases: pressReleasesCount,
        mediaContacts: mediaContactsCount,
        clippings: clippingsCount,
        events: eventsCount,
        appointments: appointmentsCount,
        citizens: citizensCount,
        socialMedia: socialMediaCount,
      },
      pendingAppointments,
      recentPressReleases,
      upcomingEvents,
    };
  }
}
