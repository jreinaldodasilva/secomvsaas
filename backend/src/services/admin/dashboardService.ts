import { TenantContext } from '../../platform/tenants/TenantContext';
import { PressRelease } from '../../modules/domain/press-releases/models/PressRelease';
import { MediaContact } from '../../modules/domain/media-contacts/models/MediaContact';
import { Clipping } from '../../modules/domain/clippings/models/Clipping';
import { Event as EventModel } from '../../modules/domain/events/models/Event';
import { Appointment } from '../../modules/domain/appointments/models/Appointment';
import { CitizenPortal } from '../../modules/domain/citizen-portal/models/CitizenPortal';
import { SocialMedia } from '../../modules/domain/social-media/models/SocialMedia';

export class DashboardService {
  async getSummary() {
    const tenantId = TenantContext.requireTenantId();
    const filter = { tenantId };
    const now = new Date();

    const [
      pressReleases,
      mediaContacts,
      clippings,
      events,
      appointments,
      citizens,
      socialMedia,
      recentPressReleases,
      upcomingEvents,
      pendingAppointments,
    ] = await Promise.all([
      PressRelease.countDocuments(filter),
      MediaContact.countDocuments(filter),
      Clipping.countDocuments(filter),
      EventModel.countDocuments(filter),
      Appointment.countDocuments(filter),
      CitizenPortal.countDocuments(filter),
      SocialMedia.countDocuments(filter),
      PressRelease.find(filter).sort({ createdAt: -1 }).limit(5).select('title status createdAt').lean(),
      EventModel.find({ ...filter, startsAt: { $gte: now } }).sort({ startsAt: 1 }).limit(5).select('title startsAt location').lean(),
      Appointment.countDocuments({ ...filter, status: 'pending' }),
    ]);

    return {
      counts: { pressReleases, mediaContacts, clippings, events, appointments, citizens, socialMedia },
      pendingAppointments,
      recentPressReleases,
      upcomingEvents,
    };
  }
}
