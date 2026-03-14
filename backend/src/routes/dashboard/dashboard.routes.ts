const { Router } = require('express');
const { TenantContext } = require('../../platform/tenants/TenantContext');
const { PressRelease } = require('../../modules/domain/press-releases/models/PressRelease');
const { MediaContact } = require('../../modules/domain/media-contacts/models/MediaContact');
const { Clipping } = require('../../modules/domain/clippings/models/Clipping');
const { Event } = require('../../modules/domain/events/models/Event');
const { Appointment } = require('../../modules/domain/appointments/models/Appointment');
const { CitizenPortal } = require('../../modules/domain/citizen-portal/models/CitizenPortal');
const { SocialMedia } = require('../../modules/domain/social-media/models/SocialMedia');

const router = Router();

router.get('/summary', async (_req, res, next) => {
  try {
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
      Event.countDocuments(filter),
      Appointment.countDocuments(filter),
      CitizenPortal.countDocuments(filter),
      SocialMedia.countDocuments(filter),
      PressRelease.find(filter).sort({ createdAt: -1 }).limit(5).select('title status createdAt').lean(),
      Event.find({ ...filter, startsAt: { $gte: now } }).sort({ startsAt: 1 }).limit(5).select('title startsAt location').lean(),
      Appointment.countDocuments({ ...filter, status: 'pending' }),
    ]);

    res.json({
      success: true,
      data: {
        counts: { pressReleases, mediaContacts, clippings, events, appointments, citizens, socialMedia },
        pendingAppointments,
        recentPressReleases,
        upcomingEvents,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.dashboardRoutes = router;
